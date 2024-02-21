const mongoose = require("mongoose");
const {Schema} = mongoose;
const productSchema = new Schema ({
    pro_cat:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Category",
    },
    pro_brand:{
        type: mongoose.Schema.Types.ObjectId,
        required : "Brand",
    },
    pro_name:{
        type: String,
        required: true,
        trim : true ,
    },
    pro_price:{
        type: Number,
        required : true,
    },
    pro_description:{
        type: String,
    },
    images:{
        type: [String],
        required: true
    },
    pro_countInStock:{
        type: Number,
        required: true,
    },
    pro_rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    pro_numReviews: {
        type: Number,
        default: 0,
    },
    pro_reviews: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Review",
        },
    ],



},{ timestamps: true }
);

const Product = mongoose.model("Product",productSchema);

module.exports= Product;