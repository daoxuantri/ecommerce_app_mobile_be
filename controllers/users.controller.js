const bcryptjs = require("bcryptjs");
const User = require("../models/users");
const Cart = require("../models/carts");
const Order = require("../models/orders");
const auth = require("../middlewares/auth");
const Review = require("../models/reviews");
const Favourite = require("../models/favourites");
const Address = require("../models/address");
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, contact } = req.body;

    const images =
      "https://res.cloudinary.com/dpczlxs5i/image/upload/v1727797764/kltn/nvhplrsb52daynbjfcnv.png";
    const salt = bcryptjs.genSaltSync(10);

    req.body.password = bcryptjs.hashSync(password, salt);

    const emails = await User.findOne({ email });

    if (emails) {
      return res.status(201).send({
        success: false,
        message: "Email đã tồn tại vui lòng đăng kí mới",
      });
    }

    const newUser = new User({
      username: username,
      password: req.body.password,
      email: email,
      contact: contact,
      images: images,
    });
    const saveUser = await newUser.save();
    if (!saveUser) {
      return res.status(201).send({
        success: false,
        message: "Đăng ký user mới không thành công!",
      });
    }
    //create cart
    const findUser = await User.findOne({ email: email });
    const createNewCart = new Cart({ user: findUser._id });
    const createCart = await createNewCart.save();

    return res.status(200).send({
      success: true,
      message: "Đăng ký user mới thành công",
      data: { ...newUser.toJSON() },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const resultUser = await User.findOne({ email });

    //kiem tra thong tin dang nhap
    if (!resultUser) {
      return res.status(201).send({
        success: false,
        message: "Thông tin đăng nhập không đúng!",
      });
    }
    //kiem tra co bi ban acc ko
    if (!resultUser.status) {
      return res.status(201).send({
        success: false,
        message: "Tài khoản của bạn bị khóa , vui lòng liên hệ với CSKH",
      });
    }
    //kiem tra mat khau
    const isCorrectPassword = bcryptjs.compareSync(
      req.body.password,
      resultUser.password
    );

    if (!isCorrectPassword)
      return res.status(201).send({
        success: false,
        message: "Sai mật khẩu, vui lòng nhập lại",
      });

    if (isCorrectPassword && resultUser) {
      const access_token = await auth.generateAccessToken(resultUser._id);
      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          ...resultUser.toJSON(),
          access_token: access_token,
        },
      });
    }
  } catch (err) {
    return next(err);
  }
};

exports.logintoken = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      return res
        .status(403)
        .json({ success: false, message: "You're not authenticated" });
    }
    const accessToken = token.split(" ")[1];
    //xac thuc nguoi dung -> login (thong qua token)
    const { authenticated, user } = await auth.authenticateLoginToken(
      accessToken
    );
    if (authenticated) {
      const access_token = await auth.generateAccessToken(user._id);
      return res.status(200).json({
        success: true,
        message: "Xác thực thành công",
        data: {
          ...user.toJSON(),
          access_token: access_token,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Token hết hạn , đăng nhập lại",
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.resetpass = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //hashSync
    const salt = bcryptjs.genSaltSync(10);
    req.body.password = bcryptjs.hashSync(password, salt);

    const saveUser = await User.findOneAndUpdate(
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

exports.getuserbyid = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const foundId = await User.findById(_id);

    if (!foundId) {
      return res.status(404).send({
        success: false,
        message: "Không tìm thấy user",
      });
    }

    // Tìm giỏ hàng của user
    const cart = await Cart.findOne({ user: _id });
    const cartTotalItems = cart ? cart.productItem.length : 0;

    // Tìm các đơn hàng của user
    const orders = await Order.find({
      user: _id,
      orderStatus: { $in: ["PROGRESS", "COMPLETED"] },
    });
    const ordersTotalItems = orders.length;

    return res.status(200).send({
      success: true,
      message: "Thành công",
      data: {
        username: foundId.username,
        email: foundId.email,
        images: foundId.images,
        bonuspoint: foundId.bonuspoint,
        status: foundId.status,
        id: foundId._id,
        cartTotalItems,
        ordersTotalItems,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params; // Lấy user ID từ URL params
    const { username, email, password, contact, bonuspoint, status } = req.body;
    // Nếu có file hình ảnh mới, lấy đường dẫn
    let updatedData = {
      username,
      email,
      contact,
      bonuspoint,
      status,
    };
    // Kiểm tra nếu có ảnh mới
    if (req.file) {
      updatedData.images = req.file.path; // Lấy đường dẫn ảnh từ middleware (Multer)
    }
    // Cập nhật thông tin user
    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true, // Trả về dữ liệu mới sau khi cập nhật
      runValidators: true, // Chạy các validator của schema
    });
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User không tồn tại",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin user thành công",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({
      success: false,
      message: "Cập nhật thông tin user thất bại",
    });
  }
};

//lay tat ca san pham gio hang cho users
exports.getcartbyuser = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const existingCart = await Cart.findOne({ user: userId }).select(
      "-__v -updatedAt -createdAt"
    );
    return res.status(200).json({
      success: true,
      data: existingCart,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Gọi phương thức `remove` để xóa user và các bản ghi liên quan
    // Xóa dữ liệu liên quan
    await Review.deleteMany({ owner: id });
    await Favourite.deleteMany({ user: id });
    await Order.deleteMany({ user: id });
    await Address.deleteMany({ user: id });
    await User.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "User and related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the user", error: error});
  }
};
