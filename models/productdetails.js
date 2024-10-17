const mongoose = require("mongoose");
const {Schema} = mongoose;
const productDetailsSchema = new Schema ({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    specifications: { 
        type: Map, of: Object }, 
},{ timestamps: true }
);

const ProductDetails  = mongoose.model("ProductDetails",productDetailsSchema);

module.exports= ProductDetails;