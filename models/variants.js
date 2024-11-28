const mongoose = require("mongoose");
const { Schema } = mongoose;

const variantSchema = new Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    memory: {
      type: String,
      required: false
    },
    variants: [
      {
        color: { type: String, required: false },
        price: {
          initial: { type: Number, required: false }, 
          discount: { type: Number, default: null }, 
        },
      },
    ],
  },
  { timestamps: true }
);

const VariantProduct = mongoose.model("VariantProduct", variantSchema);
module.exports = VariantProduct;
