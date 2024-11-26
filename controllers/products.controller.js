const Product = require("../models/products");
const Brand = require("../models/brands");
const Category = require("../models/categories");
const Banner = require("../models/banners");
const Specifications = require("../models/specifications");
const VariantProduct = require("../models/variants");
const cloudinary = require('cloudinary').v2;
const mongoose = require("mongoose"); 
const { allSort, fillInfoListProducts } = require("../handlecontrollers/products.handle");

const PAGE_SIZE = 10;

exports.createproduct = async (req, res, next) => {
    try {
        const { name, category, brand, description } = req.body; // Đã loại bỏ trường price

        // Lấy link ảnh từ Cloudinary (đã upload trước đó)
        req.body.images = req.files.map((file) => file.path);

        const newProduct = new Product({
            name: name,
            images: req.body.images,
            category: category,
            brand: brand,
            description: description,
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
        const { idproduct, name, category, brand, description } = req.body; // Đã loại bỏ trường price
        let updateFields = {};

        // Kiểm tra và chỉ thêm các trường có trong yêu cầu
        if (name) updateFields.name = name;
        if (category) updateFields.category = category;
        if (brand) updateFields.brand = brand;
        if (description) updateFields.description = description;

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

            const findlist = await Product.find({status : true}).skip(quantity).limit(PAGE_SIZE).select('-__v -createdAt -updatedAt').then(
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

//done
exports.sort = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort, order = 'asc', name, brand, rating } = req.query;

        // Tạo điều kiện lọc theo tên và brand nếu có
        const query = {};
        if (name) query.name = { $regex: name, $options: 'i' };
        if (brand) {
            const brandObj = await Brand.findOne({ name: { $regex: brand, $options: 'i' } }).select('_id');
            if (brandObj) {
                query.brand = brandObj._id;
            }
        }
        if (rating) query.rating = { $gte: parseFloat(rating) };

        // Tạo tiêu chí sắp xếp
        let sortCriteria = { createdAt: order === 'asc' ? -1 : 1 }; // Sắp xếp mặc định theo thời gian
        if (sort) {
            sortCriteria = { ...sortCriteria, [sort]: order === 'asc' ? 1 : -1 };
        }

        // Lấy dữ liệu, phân trang và sắp xếp
        const products = await Product.find(query)
            .sort(sortCriteria) // Sắp xếp theo trường được truyền vào nếu có
            .limit(parseInt(limit)) // Giới hạn số bản ghi
            .skip((parseInt(page) - 1) * parseInt(limit)); // Bỏ qua số bản ghi dựa trên trang hiện tại

        // Tính tổng số sản phẩm để tính tổng số trang
        const count = await Product.countDocuments(query);

        return res.status(200).json({
            success: true , 
            message: "Filter thành công",
            data: products,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
        });
    } catch (err) {
        next(err);
    }
};

// // getall (mac dinh) 
// exports.getall = async (req, res, next) => {
//     try {
//         const keyphone = '6710f1feec59de47203e24b4', keylaptop = '6728ae34103ff016b31ff2be';
//         const findAllPhone = await Product.find({ category: keyphone })
//             .sort({ sold: -1 })
//             .limit(16);
//         const findAllLaptop = await Product.find({ category: keylaptop })
//             .sort({ sold: -1 })
//             .limit(16);

//         return res.status(200).send({
//             success: true,
//             message: "Thành công",
//             data: {
//                 mobilephone: findAllPhone,
//                 laptop: findAllLaptop
//             }
//         });
//     } catch (err) {
//         next(err);
//     }
// };







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



// exports.getproductbyid = async (req, res, next) => {
//     try {
//         const _id = req.params.id;
//         const foundId = await Product.findOne({_id : _id, status : true});
//         if(!foundId){
//             return res.status(404).send({
//                 success: false,
//                 message: "Không tìm thấy sp"
//             })
//         }
//         return res.status(201).send({
//             success: true,
//             message: "Thành công",
//             data: foundId
//         })
//     } catch (err) {
//         return next(err);
//     }
// };

exports.getproductbyid = async (req, res, next) => {
    try {
        const _id = req.params.id;

        // Tìm sản phẩm và chỉ lọc theo `status: true`
        const foundProduct = await Product.findOne({ _id, status: true });

        if (!foundProduct) {
            return res.status(404).send({
                success: false,
                message: "Không tìm thấy sản phẩm",
            });
        }

        // Tìm chi tiết sản phẩm liên quan dựa trên `productId`
        const productDetails = await Specifications.findOne({ productId: _id });

        // Tìm tất cả các variants liên quan đến sản phẩm
        const productVariants = await VariantProduct.find({ product: _id });

        // Xử lý dữ liệu trước khi trả về
        const filteredProduct = {
            _id: foundProduct._id,
            name: foundProduct.name,
            images: foundProduct.images,
            category: foundProduct.category, // Trả nguyên giá trị gốc (chỉ chứa `_id`)
            brand: foundProduct.brand,       // Trả nguyên giá trị gốc (chỉ chứa `_id`)
            description: foundProduct.description,
            rating: foundProduct.rating,
            sold: foundProduct.sold,
            status: foundProduct.status,
            isStock: foundProduct.isStock,
        };

        const filteredDetails = productDetails
            ? productDetails.specifications.map((detail) => ({
                  category: detail.category,
                  details: detail.details.map(({ key, value }) => ({ key, value })),
              }))
            : [];

        // Trả dữ liệu sản phẩm kèm chi tiết và tất cả các variants
        return res.status(200).send({
            success: true,
            message: "Thành công",
            data: {
                product: filteredProduct,
                details: filteredDetails,
                variants: productVariants || [],
            },
        });
    } catch (err) {
        return next(err);
    }
};





exports.getall = async (req, res, next) => {
    try {
        // Lấy tất cả các category
        const categories = await Category.find();

        // Duyệt qua từng category
        const categoriesWithProducts = await Promise.all(categories.map(async (category) => {
            // Lấy tất cả sản phẩm theo category
            const products = await Product.find({ category: category._id, status: true }).populate('brand');

            // Duyệt qua từng sản phẩm để lấy variants
            const productsWithVariants = await Promise.all(products.map(async (product) => {
                // Lấy các variants liên quan đến product
                const variants = await VariantProduct.find({ product: product._id });

                // Gắn variants vào product
                return { ...product.toObject(), variants };
            }));

            // Lấy tất cả brand có sản phẩm thuộc category này
            const brands = await Brand.find({
                _id: { $in: products.map(product => product.brand) }
            });

            return {
                category,
                products: productsWithVariants,
                brands
            };
        }));

        return res.status(200).send({
            success: true,
            message: "Thành công",
            categoriesWithProducts
        });
    } catch (err) {
        next(err);
    }
};


exports.getallflutter = async (req, res, next) => {
    try {
        const banners = await Banner.find().select('-createdAt -updatedAt -__v');

        const categories = await Category.find().limit(3).select('-createdAt -updatedAt -__v');

        const categoriesWithProducts = await Promise.all(
            categories.map(async (category) => {
                const products = await Product.find({ category: category._id, status: true })
                    .select('-createdAt -updatedAt -__v')
                    .lean();

                // Sửa lại trường brand để chỉ chứa _id
                const productsWithVariants = await Promise.all(
                    products.map(async (product) => {
                        const variants = await VariantProduct.find({ product: product._id }).select('-createdAt -updatedAt -__v');
                        return {
                            ...product,
                            brand: product.brand.toString(), // Lấy trực tiếp _id
                            variants,
                        };
                    })
                );

                return {
                    category,
                    products: productsWithVariants,
                };
            })
        );

        const allProducts = await Product.find({ status: true })
            .select('-createdAt -updatedAt -__v')
            .lean();

        const topRatedProducts = await Product.find({ status: true })
            .sort({ rating: -1 })
            .limit(20)
            .select('-createdAt -updatedAt -__v')
            .lean();

        return res.status(200).send({
            success: true,
            message: 'Thành công',
            data: {
                banners,
                categories: categoriesWithProducts,
                products: allProducts,
                rating: topRatedProducts,
            },
        });
    } catch (err) {
        next(err);
    }
};




///list sp lien quan
exports.listallproduct = async (req, res, next) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId).exec();
        
        if (!product) {
            return res.status(404).send({
                success: false , 
                message: "Không tìm thấy sản phẩm",
            })
        }

        //find Related Products
        const query = {
        _id: { $ne: productId },
        $or: [
            { category: product.category }, 
            { brand: product.brand }
        ],
        };

        // Nếu cần lọc theo từ khóa tên (keyname)
        if (product.name) {
        query.$or.push({ name: { $regex: product.name, $options: "i" } });
        }

        // Thực hiện truy vấn để lấy danh sách sản phẩm liên quan
        const relatedProducts = await Product.find(query)
        .limit(10)  // Giới hạn số lượng sản phẩm liên quan
        .exec();

        return res.status(201).send({
            success: true , 
            message: "Thành công",
            data: relatedProducts
        })
    } catch (err) {
        next(err);
    }
};




// exports.sort = async (req, res, next) => {
//     try {

//         //truyen vao page = page number trang hien tai
//         const {keyword, brand, sort, page = 1}= req.body;
//         //timkiem theo tu khoa 
//         const findProduct = await Product.find({
//             $or:[
//                 {name:{ $regex: keyword, $options: 'i' } },
//                 { desc: { $regex: keyword, $options: 'i' } },
//                 { brand: { $in: await Brand.find({ name: { $regex: keyword, $options: 'i' } }) } },
//                 { category: { $in: await Category.find({ name: { $regex: keyword, $options: 'i' } }) } }
//             ],
//             status: true
//         }).select("_id price rating brand");

//         console.log(findProduct);

        
//         //B2:
//         const final = await allSort({findProduct, brand, sort}) ;
        
//         //B3:
//         //
//         const pages = Math.ceil(final.length / PAGE_SIZE);
//         const semiFinals = final.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
        
//         const finalsemi = await fillInfoListProducts(semiFinals);

//         return res.status(200).send({
//             success: true , 
//             message:"Thành công",
//             data: finalsemi,
//             pagination: {
//                 currentPage: page,
//                 totalPages: pages,
//                 totalItems: final.length
//             }
//         })
        
//         // //B2 : sap xep -> final
//         // let final = [];
//         // let semiFinal = findProduct;
//         // if (brand) semiFinal = listProducts.filter(item => item.brand === brand);

//         // if (sort === 'pASC') final.sort((a, b) => a.price - b.price);
//         // if (sort === 'pDESC') final.sort((a, b) => b.price - a.price);
//         // if (sort === 'rASC') final.sort((a, b) => a.rating - b.rating);
//         // if (sort === 'rDESC') final.sort((a, b) => b.rating - a.rating);

//         // //b3
//         // const pages = Math.ceil(final.length / PAGE_SIZE);
//         // const semiFinals = final.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
//         // const result = [];
//         // for (const product of semiFinals) {
//         //     const found = await this.fillInfoOneProduct(product._id, userId);
//         //     result.push(found);
//         // } 
   
//     } catch (err) {
//         next(err);
//     }
// };

