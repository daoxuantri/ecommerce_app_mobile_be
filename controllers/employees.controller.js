const bcryptjs = require("bcryptjs");
const Employee = require("../models/employees");
const auth = require("../middlewares/auth");
const Product = require("../models/products");
const Specifications = require("../models/specifications");
const VariantProduct = require("../models/variants");
const { default: mongoose } = require("mongoose");

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

    const variants = await VariantProduct.find({ product: productId }).lean();
    const data = {
      ...specifications,
      variants: variants ? variants : [], // Nếu không có variants thì trả về mảng rỗng
    };
    // Trả về kết quả
    return res.status(200).send({
      success: true,
      message: "Lấy specifications thành công",
      data,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getAllBrand = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const listBrandId = await Product.find({
      category: categoryId,
      status: true,
    }).distinct("brand");

    if (!listBrandId) {
      return res.status(404).send({
        success: false,
        message: "Category không tồn tại!",
      });
    }

    const listBrand = await Promise.all(
      listBrandId.map(async (id) => {
        const brand = await Brand.findById(id).select("name images _id");
        return brand ? brand : null; // Trả về tên thương hiệu hoặc null
      })
    );

    return res.status(200).send({
      success: true,
      message: "Danh sách sản phẩm",
      data: listBrand,
    });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  const session = await mongoose.startSession(); // Khởi tạo session
  session.startTransaction(); // Bắt đầu transaction

  try {
    const {
      name,
      category,
      brand,
      description,
      images,
      status,
      specifications,
      memoryVariants,
    } = req.body;

    // Step 1: Create the product
    const newProduct = new Product({
      name,
      images,
      category,
      brand,
      description,
      status,
    });

    const savedProduct = await newProduct.save();
    if (!savedProduct) {
      return res.status(400).json({
        success: false,
        message: "Thêm sản phẩm không thành công!",
      });
    }

    // Step 2: Add specifications
    if (specifications && Array.isArray(specifications)) {
      const productDetails = new Specifications({
        productId: savedProduct._id,
        specifications,
      });
      await productDetails.save();
    }

    // Step 3: Add variants
    if (memoryVariants && Array.isArray(memoryVariants)) {
      for (const memoryVariant of memoryVariants) {
        const { memory, variants } = memoryVariant;

        const formattedVariants = variants.map((variant) => ({
          color: variant.color,
          price: {
            initial: variant.price.initial,
            discount: variant.price.discount || null,
          },
        }));

        const newVariant = new VariantProduct({
          product: savedProduct._id,
          memory: memory || null,
          variants: formattedVariants,
        });

        await newVariant.save();
      }
    }
    // Commit transaction nếu tất cả các bước thành công
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Sản phẩm đã được tạo thành công với đầy đủ thông tin",
      data: savedProduct,
    });
  } catch (error) {
    console.error("Error in createFullProduct:", error);
    next(error);
  }
};

exports.updateStatusProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tìm thấy" });
    }

    product.status = status;
    await product.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Cập nhật trạng thái sản phẩm thành công",
      });
  } catch (error) {
    console.error("Error in updateStatusProduct:", error);
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res
       .status(404)
       .json({ success: false, message: "Sản phẩm không tìm thấy" });
    }
    res
     .status(200)
     .json({ success: true, message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    next(error);
  }
}

exports.getCategories = async(req, res, next) => {
  try {
    const categories = await Category.find().lean();
    res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error)
    }
}
