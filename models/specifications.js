const mongoose = require("mongoose");
const { Schema } = mongoose;

// Schema cho từng chi tiết (detail)
const detailSchema = new Schema({
    key: { type: String, required: true },
    value: { type: String, required: true }
});

// Schema cho từng mục specifications
const specificationSchema = new Schema({
    category: { type: String, required: true },
    details: [detailSchema] // Mảng các chi tiết
});

// Schema chính cho ProductDetails
const SpecificationsSchema = new Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        specifications: [specificationSchema] // Mảng các specifications
    },
    { timestamps: true }
);

const Specifications = mongoose.model("specifications", SpecificationsSchema);

module.exports = Specifications;
