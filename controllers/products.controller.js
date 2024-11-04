const Product = require("../models/products");
const Brand = require("../models/brands");
const Category = require("../models/categories");
const cloudinary = require('cloudinary').v2;
const mongoose = require("mongoose"); 
const {allSort, fillInfoListProducts} = require("../handlecontrollers/products.handle");


const PAGE_SIZE = 10;

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

//get theo page or tất cả sản phẩm
exports.getallproduct = async (req, res, next) => {
    try {
        var page = req.query.page;
        if (page){
            page = parseInt(page);
            var quantity = (page -1) * PAGE_SIZE ;

            const findlist = await Product.find({}).skip(quantity).limit(PAGE_SIZE).select('-__v -createdAt -updatedAt').then(
                data=> {
                    return res.status(200).send({
                        success: true,
                        message: "Thành công",
                        data: data
                    })
                }
            )
        }else{
            const listProduct = await Product.find().select('-__v -createdAt -updatedAt');
        
        return res.status(200).send({
            success: true,
            message: "Thành công",
            data: listProduct,
        });
        }
        
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

exports.sort = async (req, res, next) => {
    try {
        // Lấy tham số từ query
        const { page = 1, limit = 10, sort, order = 'asc', name } = req.query;

        // Tạo điều kiện lọc theo tên nếu có, nếu không thì để rỗng
        const query = name ? { name: { $regex: name, $options: 'i' } } : {};

        // Tạo chuỗi sắp xếp theo thời gian mặc định
        // Nếu có tham số sort thì thêm sắp xếp theo trường đó với thứ tự `order`
        let sortCriteria = { createdAt: order === 'asc' ? -1 : 1 }; // Sắp xếp theo thời gian mặc định
        if (sort) {
            sortCriteria = { ...sortCriteria, [sort]: order === 'asc' ? -1 : 1 };//Mặc định order = asc thì tăng dần còn không giảm dầm chảng hạng order = desc 
        }

        // Lấy dữ liệu, phân trang và sắp xếp
        const products = await Product.find(query)
            .sort(sortCriteria) // Sắp xếp theo thời gian và trường được truyền vào nếu có
            .limit(parseInt(limit)) // Giới hạn số bản ghi
            .skip((parseInt(page) - 1) * parseInt(limit)); // Bỏ qua số bản ghi dựa trên trang hiện tại

        // Tính tổng số sản phẩm để tính tổng số trang
        const count = await Product.countDocuments(query);

        res.json({
            products,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getproductbyid = async (req, res, next) => {
    try {
        const _id = req.params.id;
        const foundId = await Product.findById(_id);

        if(!foundId){
            return res.status(404).send({
                success: false,
                message: "Không tìm thấy sp"
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
