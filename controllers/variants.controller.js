const VariantProduct = require("../models/variants");
const Product = require("../models/products");

// Create Variant
exports.createvariant = async (req, res, next) => {
    try {
        const variantData = req.body;
        console.log("Payload received:", variantData);

        const { variant } = variantData;
        console.log("id", variant.productId);
        // Kiểm tra đầu vào
        if (!variant.productId || !variant.memory || !variant.variants) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin cần thiết (productId, type, variants).",
            });
        }

        // Kiểm tra xem tài liệu đã tồn tại chưa
        const existingVariant = await VariantProduct.findOne({ product: variant.productId, memory: variant.memory });

        if (existingVariant) {
            return res.status(400).json({
                success: false,
                message: "Variant với productId và type đã tồn tại.",
            });
        }

        // Tạo mới tài liệu Variant
        const newVariant = new VariantProduct({
            product: variant.productId,
            memory: variant.memory,
            variants: variant.variants,
        });

        await newVariant.save();

        res.status(201).json({
            success: true,
            message: "Tạo variant thành công.",
            data: newVariant,
        });
    } catch (error) {
        console.error("Error creating variant:", error.message);
        res.status(500).json({
            success: false,
            message: "Lỗi tạo variant.",
            error: error.message,
        });
    }
};

exports.deleteVariant = async(req, res) => {
    try {   
        const {variantId} = req.params;
        console.log("variantId:", variantId);
        // Kiểm tra đầu vào
        if (!variantId) {
            return res.status(400).json({
                success: false,
                message: 'ID variant không tồn tại'
            });
        }

        // Tìm và xóa variant
        const deletedVariant = await VariantProduct.findByIdAndDelete(variantId);
        if (!deletedVariant) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy variant'
            });
    
        }

        res.status(200).json({
            success: true,
            message: 'Xóa variant thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi xóa variant',
            error: error.message
        });
    }
};


exports.updateVariants = async (req, res) => {
    try {
        const variantData = req.body;
        console.log(variantData);
        const { variants } = variantData;
        const filter = { product: variants.productId, memory: variants.memory}; // Tìm sản phẩm theo tên
        console.log(filter);
        const update = { variants: variants.variants  }; // Dữ liệu cần cập nhật
        
        const options = { new: true, runValidators: true }; // Tùy chọn
        // Tìm variant document
        const variantDoc = await VariantProduct.findOneAndUpdate(filter, update, options);
        console.log(JSON.stringify(variantDoc));
        if (!variantDoc) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy variant'
            });
        }
        res.status(200).json({
            success: true,
            data: variantDoc
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật variant',
            error: error.message
        });
    }
};