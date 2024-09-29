const bcryptjs =require("bcryptjs");
const Brand = require("../models/brands");
const auth = require("../middlewares/auth");



exports.createbrand = async (req, res, next) => {
    try {
        const existBrand = await Brand.findOne({ name: req.body.name });
        if (existBrand) {
            const updateBrand = await Brand.findByIdAndUpdate(
                existBrand._id,
                {
                    name: req.body.name,  
                },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                message: "Cập nhật nhãn hàng thành công ",
                data: updateBrand
            });
        }

        
        const newBrand = new Brand({
            name: req.body.name,  
        });

        const saveBrand = await newBrand.save();

        return res.status(200).json({
            success: true,
            message: "Tạo nhãn hàng thành công",
            data: saveBrand
        });
    } catch (err) {
        next(err);
    }
};



