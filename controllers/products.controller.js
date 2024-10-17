const Product = require("../models/products");



exports.createproduct = async (req, res, next) => {
    try {
        // Lấy link ảnh từ Cloudinary (đã upload trước đó)
        req.body.images = req.files.map((file) => file.path);

       
        // const existProduct = await Product.findOne({ name: req.body.name });
        // if (existCategories) {
        //     const updatedCategories = await Category.findByIdAndUpdate(
        //         existCategories._id,
        //         {
        //             name: req.body.name,  
        //             images: req.body.images  
        //         },
        //         { new: true }
        //     );
        //     return res.status(200).json({
        //         success: true,
        //         message: "Cập nhật danh mục thành công",
        //         data: updatedCategories
        //     });
        // }

        
        const newProduct = new Product({
            name: req.body.name,  
            images: req.body.images,
            category: req.body.category, 
            brand: req.body.brand, 
            description: req.body.description,
            price: req.body.price,

        });

        const saveProduct = await newProduct.save();

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
        // Lấy link ảnh từ Cloudinary (đã upload trước đó)
        // req.body.images = req.files.map((file) => file.path);

       
        const existProduct = await Product.findOne({ name: req.body.name });
        if (existProduct) {
            const updatedProduct = await Product.findByIdAndUpdate(
                existProduct._id,
                { 
                    brand: req.body.brand  
                },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                message: "Cập nhật danh mục thành công",
                data: updatedProduct
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

