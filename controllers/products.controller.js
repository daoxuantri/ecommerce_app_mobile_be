const Product = require("../models/products");
const cloudinary = require('cloudinary').v2;
const mongoose = require("mongoose"); 


exports.createproduct = async (req, res, next) => {
    try {

        const { name , category , brand , description , price} = req.body; 

        // Lấy link ảnh từ Cloudinary (đã upload trước đó)
        req.body.images = req.files.map((file) => file.path);

        const newProduct = new Product({
            name: name,  
            images: req.body.images,
            category: category, 
            brand: brand, 
            description: description,
            price: price,

        });
        const saveProduct = await newProduct.save();
        if (!saveProduct) {
            return res.status(404).send({
                success: false,
                message: "Thêm sản phẩm không thành công!"
            });
        }


        return res.status(200).json({
            success: true,
            message: "Thêm sản phẩm thành công",
            data: saveProduct
        });
    } catch (err) {
        next(err);
    }
};

exports.updateproduct = async (req, res, next) => {
    try {
        const { idproduct, name, category, brand, description, price } = req.body;
        let updateFields = {};

        // Kiểm tra và chỉ thêm các trường có trong yêu cầu
        if (name) updateFields.name = name;
        if (category) updateFields.category = category;
        if (brand) updateFields.brand = brand;
        if (description) updateFields.description = description;
        if (price) updateFields.price = price;

        // Kiểm tra có file ảnh để cập nhật không
        if (req.files && req.files.length > 0) {
            updateFields.images = req.files.map((file) => file.path);
        }

        const existProduct = await Product.findById(idproduct);
        
        if (existProduct) {
            const updatedProduct = await Product.findByIdAndUpdate(
                idproduct,
                { $set: updateFields },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                message: "Cập nhật sản phẩm thành công",
                data: updatedProduct
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Sản phẩm không tồn tại"
            });
        }
    } catch (err) {
        next(err);
    }
};



exports.getallproduct = async (req, res, next) => {
    try {
        const listProduct = await Product.find().select('-__v -createdAt -updatedAt');
        
        return res.status(200).send({
            success: true,
            message: "Thành công",
            data: listProduct,
        });
    } catch (err) {
        next(err);
    }
};



//role (admin)
exports.deleteproduct = async (req, res, next) => {
    try {
        const product = req.params.id;

        const existProduct = await Product.findById(product);
        if(!existProduct){
            return res.status(201).send({
                success: true,
                message: "Không tìm thấy sản phẩm để xóa", 
            });
        }
        const deleteProduct = await Product.findByIdAndDelete(product); 
        return res.status(200).send({
            success: true,
            message: "Xóa thành công sản phẩm", 
        });
    } catch (err) {
        next(err);
    }
};



