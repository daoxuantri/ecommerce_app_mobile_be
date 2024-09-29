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
    },
    brand: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Brand",
    },
    description: {
        type : String
    },
    price: {
        type : Number,
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
        default : true
    },
    isStock: {
        type : Boolean,
        default : true
    }

},{ timestamps: true }
);

const Product = mongoose.model("Product",productSchema);

module.exports= Product;