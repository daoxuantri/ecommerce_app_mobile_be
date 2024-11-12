const Category = require("../models/categories");
const Product = require("../models/products");
const cloudinary = require('cloudinary').v2;
const mongoose = require("mongoose");

//vua update & create
exports.createcategories = async (req, res, next) => {
    try {
        // Lấy link ảnh từ Cloudinary (đã upload trước đó)
        // req.body.images = req.files.map((file) => file.path);

        req.body.images = req.files[0].path; 
        // Kiểm tra nếu danh mục đã tồn tại
        const existCategories = await Category.findOne({ name: req.body.name });
        if (existCategories) {
            const updatedCategories = await Category.findByIdAndUpdate(
                existCategories._id,
                {
                    name: req.body.name,  
                    images: req.body.images  
                },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                message: "Cập nhật danh mục thành công",
                data: updatedCategories
            });
        }

        
        const newCategories = new Category({
            name: req.body.name,  
            images: req.body.images  
        });

        const saveCategories = await newCategories.save();

        return res.status(200).json({
            success: true,
            message: "Tạo danh mục thành công",
            data: saveCategories
        });
    } catch (err) {
        next(err);
    }
};

exports.getallcategories = async (req, res, next) => {
    try {
        
        const listCategories = await Category.find().select('-__v -createdAt -updatedAt');
        
        return res.status(200).send({
            success: true,
            message: "Thành công",
            data: listCategories,
        });
    } catch (err) {
        next(err);
    }
};

exports.getcatebyid = async (req, res, next) => {
    try {
        const _id = req.params.id;
        const foundId = await Category.findById(_id);

        if(!foundId){
            return res.status(404).send({
                success: false,
                message: "Không tìm thấy Category"
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


//delete category => delete product     (xem bo sung = > ko can thiet thi bo)
exports.deletecategory = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const categoryInfo = await Category.findById(categoryId);

        if (!categoryInfo) { 
            return res.status(404).send({
                success: false,
                message: 'Category không tồn tại!'});  
        }
        //Update lại những sản phẩm có category = > set null ,
        await Product.updateMany(
            { category: categoryId },  
            { $set: { category: null } }  
        ); 
        // Sau khi cập nhật, tiến hành xóa category
        await Category.findByIdAndDelete(categoryId);

         return res.status(200).send({
            success: true,
            message: 'Xóa category thành công!'});
       
    } catch (err) {
        next(err);
    }
};


//lay sp theo danh muc
exports.getallproduct = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const listProduct = await Product.find({category: categoryId, status : true});
        if (!listProduct) { 
            return res.status(404).send({
                success: false,
                message: 'Category không tồn tại!'});  
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



