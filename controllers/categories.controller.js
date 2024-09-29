const Category = require("../models/categories");
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


exports.deletecategory = async (req, res, next) => {
    try {
        const Categoryid = req.params.id;
        const categoryInfo = await Category.findById(Categoryid);
        if (!categoryInfo) {
            return next(createError(404, 'Sản phẩm cần xóa không tồn tại!'));
        
        }

        // await Promise.all(productInfo.reviews.map((review) => Review.findByIdAndDelete(review)));
        // if (productInfo.reviews && productInfo.reviews.length > 0) {
        //     await Promise.all(productInfo.reviews.map(async (review) => {
        //         await Review.findByIdAndDelete(review);
        //     }));
        // }
        const deletecategory = await Category.findByIdAndDelete(Categoryid);
         return res.status(200).send({
            success: true,
            message: 'Sản phẩm đã được xóa thành công!'});
       
    } catch (err) {
        next(err);
    }
};
