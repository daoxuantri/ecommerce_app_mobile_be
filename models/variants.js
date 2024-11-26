const mongoose = require("mongoose");
const { Schema } = mongoose;

const variantSchema = new Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    memory: {
      type: String,
    },
    variants: [
      {
        color: { type: String, required: true },
        price: {
          initial: { type: Number, required: true }, 
          discount: { type: Number, default: null }, 
        },
      },
    ],
  },
  { timestamps: true }
);

const VariantProduct = mongoose.model("VariantProduct", variantSchema);
module.exports = VariantProduct;
