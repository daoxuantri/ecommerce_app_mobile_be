const Address = require("../models/address");
//create
exports.createaddress = async (req, res, next) => {
  try {
    const { userId, address, status, name, phone } = req.body;

    // Kiểm tra xem người dùng đã có bảng Address chưa
    let userAddress = await Address.findOne({ user: userId });

    if (!userAddress) {
      // Nếu chưa có, tạo mới bảng Address cho người dùng
      const newAddress = new Address({
        user: userId,
        location: [
          {
            address: address,
            status: status || false,
            name: name,
            phone: phone,
          },
        ],
      });

      const savedAddress = await newAddress.save();

      return res.status(200).json({
        success: true,
        message: "Thêm địa chỉ thành công",
        data: savedAddress,
      });
    } else {
      // Nếu đã có địa chỉ, kiểm tra nếu `status === true`
      if (status === true) {
        // Cập nhật tất cả các địa chỉ hiện tại thành `status: false`
        userAddress.location = userAddress.location.map((loc) => ({
          ...loc.toObject(), // Chuyển document sang object để thao tác
          status: false, // Đặt tất cả các status hiện tại thành false
        }));
      }

      // Thêm địa chỉ mới
      userAddress.location.push({
        address: address,
        status: status || false,
        name: name,
        phone: phone,
      });

      const updatedAddress = await userAddress.save();

      return res.status(200).json({
        success: true,
        message: "Đã thêm địa chỉ mới thành công",
        data: updatedAddress,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getalladdressbyuser = async (req, res, next) => {
  try {
    const userId = req.params.idUser;

    // Tìm địa chỉ của người dùng
    const userAddress = await Address.findOne({ user: userId });

    if (!userAddress) {
      return res.status(200).json({
        success: true,
        message: "Người dùng chưa có địa chỉ nào",
        data: [],
      });
    }

    // Sắp xếp các địa chỉ: địa chỉ có status: true sẽ nằm đầu
    const sortedAddresses = userAddress.location.sort((a, b) => {
      return b.status - a.status; // `true` sẽ được sắp xếp trước `false`
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách địa chỉ thành công",
      data: sortedAddresses,
    });
  } catch (err) {
    next(err);
  }
};
exports.getaddressdefault = async (req, res, next) => {
  try {
    const userId = req.params.idUser;

    const userAddress = await Address.findOne(
      { user: userId, "location.status": true },
      { location: { $elemMatch: { status: true } } }
    );

    if (!userAddress || userAddress.location.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Người dùng chưa có địa chỉ nào",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách địa chỉ thành công",
      data: userAddress.location,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteLocation = async (req, res, next) => {
  const userId = req.params.userId; // Lấy userId từ params
  const locationId = req.params.locationId; // Lấy locationId từ params

  try {
    // Tìm Address của user và xóa location có locationId
    const updatedAddress = await Address.findOneAndUpdate(
      { user: userId, "location._id": locationId },  // Tìm Address theo userId và locationId
      {
        $pull: { location: { _id: locationId } }  // Xóa location với locationId
      },
      { new: true }  // Trả về tài liệu đã được cập nhật
    );

    if (!updatedAddress) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ hoặc location không tồn tại' });
    }

    res.status(200).json({
      message: 'Xóa location thành công.',
      updatedAddress,
    });
  } catch (error) {
    next(error);
  }
};


exports.updateDefaultAddress = async (req, res, next) => {
  const { userId, addressId } = req.body;

  try {
    // Tìm địa chỉ của người dùng
    const userAddress = await Address.findOne({ user: userId });

    if (!userAddress) {
      return res.status(404).json({ message: "Không tìm thấy danh sách địa chỉ của người dùng" });
    }

    // Cập nhật trạng thái của tất cả địa chỉ thành `false`
    userAddress.location = userAddress.location.map((loc) => ({
      ...loc.toObject(), // Chuyển document sang object
      status: loc._id.toString() === addressId ? true : false, // Đặt `true` cho địa chỉ được chọn, còn lại là `false`
    }));

    // Lưu thay đổi
    const updatedAddress = await userAddress.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật địa chỉ mặc định thành công.",
      data: updatedAddress,
    });
  } catch (error) {
    next(error);
  }
};
