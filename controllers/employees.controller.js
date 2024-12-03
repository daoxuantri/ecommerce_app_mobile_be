const bcryptjs = require("bcryptjs");
const Employee = require("../models/employees");
const auth = require("../middlewares/auth");
const Product = require("../models/products");
const Specifications = require("../models/specifications");
const VariantProduct = require("../models/variants");

//(role admin tạo tk employee)
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, contact } = req.body;

    //tạo trước 1 ảnh của nhân viên ( chưa update ảnh nhân viên)
    const images =
      "https://res.cloudinary.com/dpczlxs5i/image/upload/v1727797764/kltn/nvhplrsb52daynbjfcnv.png";
    const salt = bcryptjs.genSaltSync(10);

    req.body.password = bcryptjs.hashSync(password, salt);

    const emails = await Employee.findOne({ email });

    if (emails) {
      return res.status(201).send({
        success: false,
        message: "Email đã tồn tại vui lòng đăng kí mới",
      });
    }

    const newEmployee = new Employee({
      username: username,
      password: req.body.password,
      email: email,
      role: req.body.role,
      contact: contact,
      images: images,
    });
    const saveUser = await newEmployee.save();
    if (!saveUser) {
      return res.status(201).send({
        success: false,
        message: "Đăng ký Employee mới không thành công!",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Đăng ký employee mới thành công",
      data: { ...newEmployee.toJSON() },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const resultEmployee = await Employee.findOne({ email });

    //kiem tra thong tin dang nhap
    if (!resultEmployee) {
      return res.status(201).send({
        success: false,
        message: "Thông tin đăng nhập không đúng!",
      });
    }
    //kiem tra mat khau
    const isCorrectPassword = bcryptjs.compareSync(
      req.body.password,
      resultEmployee.password
    );
    console.log(isCorrectPassword);
    if (!isCorrectPassword)
      return res.status(201).send({
        success: false,
        message: "Sai mật khẩu, vui lòng nhập lại",
      });

    if (isCorrectPassword && resultEmployee) {
      const access_token = auth.generateAccessToken(resultEmployee._id);
      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          ...resultEmployee.toJSON(),
          access_token: access_token,
        },
      });
    }
  } catch (err) {
    return next(err);
  }
};

exports.resetpass = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //hashSync
    const salt = bcryptjs.genSaltSync(10);
    req.body.password = bcryptjs.hashSync(password, salt);

    const saveUser = await Employee.findOneAndUpdate(
      { email: email },
      { password: req.body.password },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Cập nhật mật khẩu thành công.",
    });
  } catch (err) {
    return next(err);
  }
};

exports.getempbyid = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const foundId = await Employee.findById(_id);

    if (!foundId) {
      return res.status(404).send({
        success: false,
        message: "Không tìm thấy Employee",
      });
    }
    return res.status(201).send({
      success: true,
      message: "Thành công",
      data: foundId,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      startDate,
      endDate,
      sortBy = "createdAt", // Mặc định sắp xếp theo ngày tạo
      order = "desc", // Sắp xếp giảm dần
      page = 1, // Mặc định trang đầu tiên
      limit = 10, // Mặc định số sản phẩm trên mỗi trang
    } = req.query;

    // Tạo query filter
    const filters = {};

    if (category) {
      filters.category = category; // Lọc theo category
    }

    if (brand) {
      filters.brand = brand; // Lọc theo brand
    }

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate); // Ngày bắt đầu
      if (endDate) filters.createdAt.$lte = new Date(endDate); // Ngày kết thúc
    }

    // Tính toán phân trang
    const skip = (Number(page) - 1) * Number(limit);

    // Lấy danh sách sản phẩm với các điều kiện
    const products = await Product.find(filters)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 }) // Sắp xếp theo trường và thứ tự
      .skip(skip) // Bỏ qua số sản phẩm tương ứng
      .limit(Number(limit)) // Giới hạn số sản phẩm trả về
      .populate("category", "_id name") // Populate thông tin category
      .populate("brand", "_id name"); // Populate thông tin brand

    // Tổng số sản phẩm
    const totalProducts = await Product.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: {
        products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit), // Tổng số trang
        currentPage: Number(page),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const productId = req.params.productId; // Lấy productId từ URL

    // Tìm kiếm specifications dựa trên productId
    const specifications = await Specifications.findOne({ productId })
      .populate({
        path: "productId", // Populate Product
        populate: [
          { path: "category", select: "_id name" }, // Populate Category
          { path: "brand", select: "_id name" }, // Populate Brand
        ],
      })
      .lean(); // Chuyển đổi sang object đơn giản

    if (!specifications) {
      return res.status(404).send({
        success: false,
        message: "Không tìm thấy specifications cho sản phẩm này",
      });
    }

    const variants = await VariantProduct.find({ product: productId }).lean()
    const data = {
        ...specifications,
        variants: variants ? variants : [], // Nếu không có variants thì trả về mảng rỗng
      };
    // Trả về kết quả
    return res.status(200).send({
      success: true,
      message: "Lấy specifications thành công",
      data
    });
  } catch (err) {
    return next(err);
  }
};
