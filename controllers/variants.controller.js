const VariantProduct = require("../models/variants");
const Product = require("../models/products");

// Create Variant
exports.createvariant = async (req, res, next) => {
    try {
        const { productId, memory, variants, stockQuantity } = req.body;

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
                stockQuantity: variant.stockQuantity
            };
        });

        // Tạo variant mới
        const newVariant = new VariantProduct({
            product: productId,
            memory: memory ? memory : "null", // Nếu memory không có, gán giá trị là "null"
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


exports.updateVariants = async (req, res) => {
    try {
        const { productId ,variantId, variantIndex } = req.params;
        const variantData = req.body;

        // Tìm variant document
        const variantDoc = await VariantProduct.findById(variantId);

        if (!variantDoc) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy variant'
            });
        }

        // Cập nhật variant tại index cụ thể
        variantDoc.variants[variantIndex] = {
            ...variantDoc.variants[variantIndex],
            ...variantData
        };

        await variantDoc.save();

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