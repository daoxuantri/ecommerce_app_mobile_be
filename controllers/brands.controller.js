const bcryptjs =require("bcryptjs");
const Brand = require("../models/brands");
const auth = require("../middlewares/auth");
const Product = require("../models/products");
const cloudinary = require('cloudinary').v2;
const mongoose = require("mongoose");

//done
exports.createbrand = async (req, res, next) => {
    try {
        req.body.images = req.files[0].path;
        const existBrand = await Brand.findOne({ name: req.body.name });
        if (existBrand) {
            const updateBrand = await Brand.findByIdAndUpdate(
                existBrand._id,
                {
                    name: req.body.name,  
                    images: req.body.images   
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
            images: req.body.images 
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


exports.getallbrand = async (req, res, next) => {
    try {
        
        const listBrand = await Brand.find().select('-__v -createdAt -updatedAt');
        
        return res.status(200).send({
            success: true,
            message: "Thành công",
            data: listBrand,
        });
    } catch (err) {
        next(err);
    }
};


// xem bo sung => ko can thiet thi bo
exports.deletebrand = async (req, res, next) => {
    try {
        const brandId = req.params.id; 
        //Tim kiem brand
        const findbrand = await Brand.findById(brandId);
        if (!findbrand) {
            return res.status(404).send({
                success: false,
                message: 'Brand không tồn tại!'}); 
        }

        //Xoa brand
        const brand = await Brand.findByIdAndDelete(brandId);
        // Update Product(Brand) => set null
        await Product.updateMany({ brand: brandId }, { $set: { brand: null } });
        return res.status(200).json({
            success: true,
            message: "Xóa Brand thành công"
        });
        
    } catch (error) {
        next(error);
    }
};




