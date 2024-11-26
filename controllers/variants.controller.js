const VariantProduct = require("../models/variants");
const Product = require("../models/products");

// Create Variant
exports.createvariant = async (req, res, next) => {
    try {
        const { productId, memory, variants } = req.body;

        // Kiểm tra sản phẩm có tồn tại
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Kiểm tra và chuẩn hóa dữ liệu variants
        const formattedVariants = variants.map(variant => {
            if (!variant.price || !variant.price.initial) {
                throw new Error("Each variant must have an 'initial' price.");
            }

            return {
                color: variant.color,
                price: {
                    initial: variant.price.initial,
                    discount: variant.price.discount || null, // Nếu không có giảm giá, đặt discount là null
                },
            };
        });

        // Tạo variant mới
        const newVariant = new VariantProduct({
            product: productId,
            memory: memory || null, // Đặt memory là null nếu không cung cấp
            variants: formattedVariants,
        });

        // Lưu vào cơ sở dữ liệu
        const savedVariant = await newVariant.save();

        return res.status(201).json({
            success: true,
            message: "Variant created successfully",
            data: savedVariant,
        });
    } catch (error) {
        // Xử lý lỗi và trả về lỗi chi tiết
        return res.status(400).json({
            success: false,
            message: error.message || "An error occurred",
        });
    }
};


// //update 
// exports.updatebanner = async (req, res, next) => {
//     try { 

//         const {idbanner, name, description} = req.body;

//         let updateFields = {}; 
//         // Kiểm tra và chỉ thêm các trường có trong yêu cầu
//         if (name) updateFields.name = name; 
//         if (description) updateFields.description = description; 
        
//         // Kiểm tra có file ảnh để cập nhật không
//         if (req.files && req.files.length > 0) {
//             updateFields.images = req.files.map((file) => file.path);
//         }

//         //timkiem
//         const existBanner = await Banner.findOne({_id : idbanner});

//         if (existBanner) {
//             const updateBanner = await Banner.findByIdAndUpdate(
//                 existBanner._id,
//                 { $set: updateFields },
//                 { new: true }
//             );
//             return res.status(200).json({
//                 success: true,
//                 message: "Cập nhật quảng cáo thành công ",
//                 data: updateBanner
//             });
//         }else{
//             return res.status(404).json({
//                 success: false,
//                 message: "Không tìm thấy quảng cáo"
//             });
//         }
//     } catch (err) {
//         next(err);
//     }
// };


// exports.getallbanner = async (req, res, next) => {
//     try {
        
//         const listBanner = await Banner.find().select('-__v -createdAt -updatedAt');
        
//         return res.status(200).send({
//             success: true,
//             message: "Thành công",
//             data: listBanner,
//         });
//     } catch (err) {
//         next(err);
//     }
// };
// exports.getbannerbyid = async (req, res, next) => {
//     try {
//         const _id = req.params.id;
//         const foundId = await Banner.findById(_id);

//         if(!foundId){
//             return res.status(404).send({
//                 success: false,
//                 message: "Không tìm thấy Banner"
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

 

// //delete
// exports.deletebanner = async (req, res, next) => {
//     try {
//         const bannerId = req.params.id;
//         const bannerInfo = await Banner.findById(bannerId);

//         if (!bannerInfo) { 
//             return res.status(404).send({
//                 success: false,
//                 message: 'Banner không tồn tại!'});  
//         }
//         //Xóa banner
//         const deletebanner = await Banner.findByIdAndDelete(bannerId);

//          return res.status(200).send({
//             success: true,
//             message: 'Xóa banner thành công!'});
       
//     } catch (err) {
//         next(err);
//     }
// };


// exports.home = async (req, res, next) => {
//     try {
//         const bannerId = req.params.id;
//         const bannerInfo = await Banner.findById(bannerId);

//         if (!bannerInfo) { 
//             return res.status(404).send({
//                 success: false,
//                 message: 'Banner không tồn tại!'});  
//         }
//         //Xóa banner
//         const deletebanner = await Banner.findByIdAndDelete(bannerId);

//          return res.status(200).send({
//             success: true,
//             message: 'Xóa banner thành công!'});
       
//     } catch (err) {
//         next(err);
//     }
// };
