const Address = require("../models/address");
//create
exports.createaddress = async (req, res, next) => {
    try { 

        const { userId, address, status , name , phone} = req.body;

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
                        name : name ,
                        phone : phone
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
            // Nếu đã có, thêm địa chỉ mới vào danh sách
            userAddress.location.push({
                address: address,
                status: status || false,
                name : name ,
                phone : phone
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
        const  userId  = req.params.idUser;  

        // Tìm địa chỉ của người dùng
        const userAddress = await Address.findOne({ user: userId });

        if (!userAddress) {
            return res.status(200).json({
                success: true,
                message: "Người dùng chưa có địa chỉ nào",
                data: []
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

exports.getaddressdefault = async (req, res, next) => {
    try {
        const userId = req.params.idUser ;  

        const userAddress = await Address.findOne(
            { user: userId, "location.status": true }, 
            { location: { $elemMatch: { status: true } } } 
        );

        if (!userAddress || userAddress.location.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Người dùng chưa có địa chỉ nào",
                data: []
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


