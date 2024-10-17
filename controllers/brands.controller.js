const bcryptjs =require("bcryptjs");
const Brand = require("../models/brands");
const auth = require("../middlewares/auth");
const Product = require("../models/products");



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


exports.deletebrand = async (req, res, next) => {
    try {
        const {brandId} = req.body; 
        const brand = await Brand.findById(brandId);
        if (brand) {
            const brand = await Brand.findByIdAndDelete(brandId);

    }
        // Cập nhật tất cả các sản phẩm có brand là ObjectId của brand bị xóa
        await Product.updateMany({ brand: brandId }, { $set: { brand: null } });
        return res.status(200).json({
            success: true,
            message: "Xóa nhãn hàng thành công"
        });
        
    } catch (error) {
        next(error);
    }
};




