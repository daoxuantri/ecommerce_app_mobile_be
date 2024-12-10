const bcryptjs =require("bcryptjs");
const Brand = require("../models/brands");
const auth = require("../middlewares/auth");
const Product = require("../models/products");
const cloudinary = require('cloudinary').v2;
const mongoose = require("mongoose");

exports.createbrand = async (req, res, next) => {
    try {
        // Lấy link ảnh từ Cloudinary (đã upload trước đó)
        req.body.images = req.files[0]?.path;
        const newBrand = new Brand({
            name: req.body.name,
            images: req.body.images,
            status: req.body.status || false, // Mặc định là `false` nếu không cung cấp
        });

        const saveBrand = await newBrand.save();

        return res.status(200).json({
            success: true,
            message: "Tạo nhãn hàng thành công",
            data: saveBrand,
        });
    } catch (err) {
        next(err);
    }
};

exports.updatebrand = async (req, res, next) => {
    try {
        // Lấy link ảnh từ Cloudinary (đã upload trước đó)
        req.body.images = req.files[0]?.path;
        const {brandId} = req.params;
        // Kiểm tra nếu nhãn hàng đã tồn tại
        const existBrand = await Brand.findOne({ _id: brandId ? brandId : null });
        if (existBrand) {
            const updateBrand = await Brand.findByIdAndUpdate(
                existBrand._id,
                {
                    name: req.body.name,
                    images: req.body.images,
                    status: req.body.status || existBrand.status, // Giữ trạng thái cũ nếu không cung cấp
                },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                message: "Cập nhật nhãn hàng thành công",
                data: updateBrand,
            });
        }

        // Tạo mới nhãn hàng với trạng thái
        const newBrand = new Brand({
            name: req.body.name,
            images: req.body.images,
            status: req.body.status || false, // Mặc định là `false` nếu không cung cấp
        });

        const saveBrand = await newBrand.save();

        return res.status(200).json({
            success: true,
            message: "Tạo nhãn hàng thành công",
            data: saveBrand,
        });
    } catch (err) {
        next(err);
    }
};


exports.getallbrand = async (req, res, next) => {
    try {
        
        const listBrand = await Brand.find({status : true}).select('-__v -createdAt -updatedAt');
        
        return res.status(200).send({
            success: true,
            message: "Thành công",
            data: listBrand,
        });
    } catch (err) {
        next(err);
    }
};

exports.getbrandbyid = async (req, res, next) => {
    try {
        const _id = req.params.id;
        const foundId = await Brand.findById(_id);
        const findStatus = await Brand.find({_id : _id , status : true});

        if(!foundId){
            return res.status(404).send({
                success: false,
                message: "Không tìm thấy Brand"
            })
        }else if (findStatus.length == 0   ){
            return res.status(404).send({
                success: false,
                message: "Nhãn hàng này hiện tại đã giới hạn"
            })
        }
        return res.status(201).send({
            success: true,
            message: "Thành công",
            data: foundId
        })
    } catch (err) {
        return next(err);
    }
};

//lay sp theo danh muc
exports.getallproduct = async (req, res, next) => {
    try {
        const brandId = req.params.id;
        const listProduct = await Product.find({brand: brandId, status: true});
        if (!listProduct) { 
            return res.status(404).send({
                success: false,
                message: 'Brand không tồn tại!'});  
        }


         return res.status(200).send({
            success: true,
            message: 'Danh sách sản phẩm',
            data: listProduct
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




