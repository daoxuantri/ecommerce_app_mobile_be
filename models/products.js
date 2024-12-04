const mongoose = require("mongoose");
const {Schema} = mongoose;
const productSchema = new Schema ({
    name: {
        type : String,
        required : true
    },
    images:{
        type: [String],
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default : null
    },
    brand: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        default: null
    },
    description: {
        type : String
    },
    rating: {
        type : Number,
        default: 0 ,
    },
    sold: {
        type : Number,
        default: 0 ,
    },
    status: {
        type : Boolean,
        default : false
    },
    isStock: {
        type : Boolean,
        default : true
    },

},{ timestamps: true }
);

const Product = mongoose.model("Product",productSchema);

module.exports= Product;