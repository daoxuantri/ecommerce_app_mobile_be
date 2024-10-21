const Product = require("../models/products");



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
        req.body.images = req.files.map((file) => file.path);

        const { idproduct , name , category,  brand , description, price  } =  req.body; 
       
        const existProduct = await Product.findById({ _id: idproduct });
        if (existProduct) {
            const updatedProduct = await Product.findByIdAndUpdate(
                existProduct._id,
                { 
                    name: name,  
                    images: req.body.images,
                    category: category, 
                    brand: brand, 
                    description: description,
                    price: price, 
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

