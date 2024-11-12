const Product = require("../models/products");
const ProductDetails = require("../models/productdetails");
const mongoose = require("mongoose"); 



exports.getbyid = async (req, res, next) => {
    try {
        const  productId  = req.params.id;

        const productDetails = await ProductDetails.findOne({ productId }).populate('productId');

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


exports.createdetailproduct = async (req, res, next) => {
    try {
        const { productId, specifications } = req.body;

        const foundProduct = await Product.findById(productId);

        // Validate input
        if (!foundProduct || !productId || !specifications) {
            return res.status(400).json({
                success: true,
                message: "Không tìm thấy" });
        }

        // Convert the specifications array into a Map format for MongoDB storage
        const specificationsMap = new Map();
        specifications.forEach(({ key, value }) => {
            specificationsMap.set(key, value);
        });

        // Create a new ProductDetails document with the transformed specifications
        const productDetails = new ProductDetails({
            productId,
            specifications: specificationsMap,
        });

        // Save to database
        await productDetails.save();

        // Convert the specifications Map back to an array for response
        const responseSpecifications = Array.from(productDetails.specifications).map(([key, value]) => ({ key, value }));

        return res.status(201).json({
            success: true ,
            message: "Thành công",
            data:  responseSpecifications});
    }  catch (err) {
        next(err);
    }
};