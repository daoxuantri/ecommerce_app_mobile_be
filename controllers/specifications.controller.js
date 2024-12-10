const Product = require("../models/products");
const Specifications = require("../models/specifications");
const mongoose = require("mongoose"); 



exports.getbyid = async (req, res, next) => {
    try {
        const  productId  = req.params.id;

        const productDetails = await Specifications.findOne({ productId }).populate('productId');

        if (!productDetails) {
            return res.status(404).json({ 
                succes: false ,
                message: "Không tìm thấy" });
        }
        const responseSpecifications = Array.from(productDetails.specifications).map(([key, value]) => ({ key, value }));

        // Send the formatted response
        return res.status(200).json({
            success: true,
            message: "Thành công",
            data: {
                productId: productDetails.productId,
                specifications: responseSpecifications
            }
        });
    }  catch (err) {
        next(err);
    }
};


exports.createDetailProduct = async (req, res, next) => {
    try {
        const { productId, specifications } = req.body;

        const foundProduct = await Product.findById(productId);

        // Validate input
        if (!foundProduct || !productId || !specifications || !Array.isArray(specifications)) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ hoặc không tìm thấy sản phẩm",
            });
        }

        // Validate specifications format
        const validSpecifications = specifications.every(
            (spec) => spec.category && Array.isArray(spec.details)
        );
        if (!validSpecifications) {
            return res.status(400).json({
                success: false,
                message: "Thông tin specifications không đúng định dạng",
            });
        }

        // Prepare the specifications data for MongoDB
        const productDetails = new Specifications({
            productId,
            specifications,
        });

        // Save to database
        await productDetails.save();

        return res.status(201).json({
            success: true,
            message: "Thêm chi tiết sản phẩm thành công",
            data: productDetails,
        });
    } catch (err) {
        next(err);
    }
};

exports.updateSpecifications = async (req, res) => {
    try {
      const { productId } = req.params;
      const { specifications } = req.body;
  
      const updatedSpecifications = await Specifications.findOneAndUpdate(
        { productId },
        { specifications },
        { new: true, upsert: true }
      );
  
      res.status(200).json({
        success: true,
        data: updatedSpecifications,
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      next(error);
    }
}