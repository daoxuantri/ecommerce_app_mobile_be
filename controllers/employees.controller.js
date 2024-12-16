const bcryptjs = require("bcryptjs");
const Employee = require("../models/employees");
const auth = require("../middlewares/auth");
const Product = require("../models/products");
const Specifications = require("../models/specifications");
const VariantProduct = require("../models/variants");
const { default: mongoose } = require("mongoose");
const Brand = require("../models/brands");
const Category = require("../models/categories");
const Categories = require("../models/categories");
const User = require("../models/users");
const Order = require("../models/orders");

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
exports.getEmployeesById = async(req, res, next) => {
  try {
      const { id } = req.params; // Lấy id từ URL
      const employee = await Employee.findById(id); // Tìm employee theo ID

      if (!employee) {
          return res.status(404).json({ message: "Employee not found" }); // Không tìm thấy
      }

      res.status(200).json(employee); // Trả về dữ liệu employee
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message }); // Lỗi server
  }
}
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      name,
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

    if (name) {
      filters.name = { $regex: name, $options: "i" }; // Tìm kiếm theo tên, không phân biệt hoa thường
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

exports.getProductsOnSales = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      name,
      startDate,
      endDate,
      sortBy = "createdAt", // Mặc định sắp xếp theo ngày tạo
      order = "desc", // Sắp xếp giảm dần
      page = 1, // Mặc định trang đầu tiên
      limit = 10, // Mặc định số sản phẩm trên mỗi trang
    } = req.query;

     // Tạo query filter
     const filters = {
      status: true, // Chỉ lấy sản phẩm có status bằng true
    };

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

    if (name) {
      filters.name = { $regex: name, $options: "i" }; // Tìm kiếm theo tên, không phân biệt hoa thường
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

    const product = await Product.findById(productId)
    .populate([
      { path: "category", select: "_id name" }, 
      { path: "brand", select: "_id name" }, 
    ])
    .select("-__v")
    .lean();
    // Tìm kiếm specifications dựa trên productId
    const specifications = await Specifications.findOne({ productId }).select("-category -brand").lean(); // Chuyển đổi sang object đơn giản

    const variants = await VariantProduct.find({ product: productId }).lean();
    const data = {
      ...product,
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

exports.getEmployees = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortField = "createdAt",
      sortOrder = "asc",
      search = "",
    } = req.query;

    const query = search ? { username: { $regex: search, $options: "i" } } : {};

    const sort = {
      [sortField]: sortOrder === "desc" ? -1 : 1,
    };

    const totalStaffs = await Employee.countDocuments(query);
    const totalPages = Math.ceil(totalStaffs / limit);

    const staffs = await Employee.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-__v -pasword");
    res.json({
      data: {
        staffs,
        totalStaffs,
        totalPages,
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    next(error);
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
  let savedProduct = null;
  let savedSpecs = null;
  try {
    const { name, category, brand, description, images, status } = req.body;
    const specifications = JSON.parse(req.body.specifications || "[]"); // Parse specifications từ JSON string
    const memoryVariants = JSON.parse(req.body.memoryVariants || "[]"); // Parse memoryVariants từ JSON string
    // Lấy link ảnh từ Cloudinary (đã upload trước đó)
    req.body.images = req.files.map((file) => file.path);
    console.log(JSON.stringify(specifications));
    console.log(JSON.stringify(memoryVariants));

    // Step 1: Create the product
    const newProduct = new Product({
      name,
      images: req.body.images,
      category,
      brand,
      status,
      description,
    });

    savedProduct = await newProduct.save();
    if (!savedProduct) {
      return res.status(400).json({
        success: false,
        message: "Thêm sản phẩm không thành công!",
      });
    }

    // Step 2: Add specifications
    const productDetails = new Specifications({
      productId: savedProduct._id,
      specifications,
    });
    savedSpecs = await productDetails.save();

    // Step 3: Add variants
    for (const memoryVariant of memoryVariants) {
      const newVariant = new VariantProduct({
        product: savedProduct._id,
        ...memoryVariant,
      });
      await newVariant.save();
    }

    return res.status(201).json({
      success: true,
      message: "Sản phẩm đã được tạo thành công với đầy đủ thông tin",
      data: savedProduct,
    });
  } catch (error) {
    console.error("Lỗi trong quá trình tạo sản phẩm:", error);
    // Rollback nếu có lỗi xảy ra
    if (savedProduct) {
      await Product.findByIdAndDelete(savedProduct._id);
    }
    if (savedSpecs) {
      await Specifications.findByIdAndDelete(savedSpecs._id);
    }
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
    res.status(200).json({
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
    res.status(200).json({ success: true, message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortField = "createdAt",
      sortOrder = "asc",
      search = "",
    } = req.query; // Lấy giá trị 'name' từ query string

    const sort = {
      [sortField]: sortOrder === "desc" ? -1 : 1,
    };

    const query = search
      ? { name: { $regex: search, $options: "i" } } // Tìm kiếm theo 'name' (không phân biệt hoa thường)
      : {}; // Không có name thì trả về tất cả

    const totalCategories = await Categories.countDocuments(query);
    const totalPages = Math.ceil(totalCategories / limit);

    const categories = await Categories.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-__v");
    res.json({
      data: {
        categories,
        totalCategories,
        totalPages,
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBrands = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortField = "createdAt",
      sortOrder = "asc",
      search = "",
    } = req.query; // Lấy giá trị 'name' từ query string

    const sort = {
      [sortField]: sortOrder === "desc" ? -1 : 1,
    };

    const query = search
      ? { name: { $regex: search, $options: "i" } } // Tìm kiếm theo 'name' (không phân biệt hoa thường)
      : {}; // Không có name thì trả về tất cả

    const totalBrands = await Brand.countDocuments(query);
    const totalPages = Math.ceil(totalBrands / limit);

    const brands = await Brand.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-__v");
    res.json({
      data: {
        brands,
        totalBrands,
        totalPages,
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortField = "createdAt",
      sortOrder = "asc",
      search = "",
    } = req.query; // Lấy giá trị 'name' từ query string

    const sort = {
      [sortField]: sortOrder === "desc" ? -1 : 1,
    };

    const query = search
      ? { username: { $regex: search, $options: "i" } } // Tìm kiếm theo 'name' (không phân biệt hoa thường)
      : {}; // Không có name thì trả về tất cả

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-__v -password");
    res.json({
      data: {
        users,
        totalUsers,
        totalPages,
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteStaff = async (req, res) => {
  const user = req.user;
  if (user.role !== 'admin') {
    return res.status(403).json({ message: "Only admins can delete." });
  }

  try {
    const { id } = req.params;

    // Tìm 
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Not found" });
    }

    await Employee.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the staff", error: error});
  }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params; // Lấy user ID từ URL params
    const { username, email, contact, role } = req.body;
    // Nếu có file hình ảnh mới, lấy đường dẫn
    let updatedData = {
      username,
      email,
      contact,
      role
    };
    // Kiểm tra nếu có ảnh mới
    if (req.file) {
      updatedData.images = req.file.path; // Lấy đường dẫn ảnh từ middleware (Multer)
    }
    // Cập nhật thông tin user
    const updatedUser = await Employee.findByIdAndUpdate(id, updatedData, {
      new: true, // Trả về dữ liệu mới sau khi cập nhật
      runValidators: true, // Chạy các validator của schema
    });
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Staff không tồn tại",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin staff thành công",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error updating staff:", err);
    return res.status(500).json({
      success: false,
      message: "Cập nhật thông tin staff thất bại",
    });
  }
};



exports.getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortField = "createdAt",
      sortOrder = "asc",
      search = "", // Dùng cho tìm kiếm
      orderStatus = "", // Có thể tìm kiếm theo trạng thái đơn hàng
    } = req.query;

    const sort = {
      [sortField]: sortOrder === "desc" ? -1 : 1,
    };

    // Tạo query tìm kiếm
    const query = {};

    // Nếu có 'search' thì tìm kiếm theo tên người dùng
    if (search) {
      query["infomationUser.name"] = { $regex: search, $options: "i" };
    }

    // Nếu có 'orderStatus' thì lọc theo trạng thái đơn hàng
    if (orderStatus && orderStatus !== "") {
      query["orderStatus"] = orderStatus;
    }

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    // Lấy danh sách đơn hàng, sắp xếp, phân trang và giới hạn kết quả
    const orders = await Order.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("user", "username email") // Nếu cần thêm thông tin từ bảng User
      .populate("productItem.product", "name price") // Nếu cần thêm thông tin sản phẩm
      .select("-__v "); // Loại bỏ trường __v (version key)

    res.json({
      data: {
        orders,
        totalOrders,
        totalPages,
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    next(error);
  }
};
