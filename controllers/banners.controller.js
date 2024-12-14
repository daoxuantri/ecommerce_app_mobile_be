const Banner = require("../models/banners");
const Product = require("../models/products");
const cloudinary = require('cloudinary').v2;
const mongoose = require("mongoose");

//create
exports.createbanner = async (req, res, next) => {
    try { 

        req.body.images = req.files[0].path;
        const newBanner = new Banner({
            name: req.body.name,  
            images: req.body.images  ,
            description: req.body.description,
        });

        const saveBanner = await newBanner.save();

        return res.status(200).json({
            success: true,
            message: "Tạo quảng cáo thành công",
            data: saveBanner
        });
    } catch (err) {
        next(err);
    }
};

//update 
exports.updatebanner = async (req, res, next) => {
    try { 

        const {idbanner, name, description} = req.body;

        let updateFields = {}; 
        // Kiểm tra và chỉ thêm các trường có trong yêu cầu
        if (name) updateFields.name = name; 
        if (description) updateFields.description = description; 
        
        // Kiểm tra có file ảnh để cập nhật không
        if (req.files && req.files.length > 0) {
            updateFields.images = req.body.images = req.files[0].path;;
        }

        //timkiem
        const existBanner = await Banner.findOne({_id : idbanner});

        if (existBanner) {
            const updateBanner = await Banner.findByIdAndUpdate(
                existBanner._id,
                { $set: updateFields },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                message: "Cập nhật quảng cáo thành công ",
                data: updateBanner
            });
        }else{
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy quảng cáo"
            });
        }
    } catch (err) {
        next(err);
    }
};


exports.getallbanner = async (req, res, next) => {
    try {
        
        const listBanner = await Banner.find().select('-__v -createdAt -updatedAt');
        
        return res.status(200).send({
            success: true,
            message: "Thành công",
            data: listBanner,
        });
    } catch (err) {
        next(err);
    }
};
exports.getbannerbyid = async (req, res, next) => {
    try {
        const _id = req.params.id;
        const foundId = await Banner.findById(_id);

        if(!foundId){
            return res.status(404).send({
                success: false,
                message: "Không tìm thấy Banner"
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

 

//delete
exports.deletebanner = async (req, res, next) => {
    try {
        const bannerId = req.params.id;
        const bannerInfo = await Banner.findById(bannerId);

        if (!bannerInfo) { 
            return res.status(404).send({
                success: false,
                message: 'Banner không tồn tại!'});  
        }
        //Xóa banner
        const deletebanner = await Banner.findByIdAndDelete(bannerId);

         return res.status(200).send({
            success: true,
            message: 'Xóa banner thành công!'});
       
    } catch (err) {
        next(err);
    }
};


exports.home = async (req, res, next) => {
    try {
        const bannerId = req.params.id;
        const bannerInfo = await Banner.findById(bannerId);

        if (!bannerInfo) { 
            return res.status(404).send({
                success: false,
                message: 'Banner không tồn tại!'});  
        }
        //Xóa banner
        const deletebanner = await Banner.findByIdAndDelete(bannerId);

         return res.status(200).send({
            success: true,
            message: 'Xóa banner thành công!'});
       
    } catch (err) {
        next(err);
    }
};
