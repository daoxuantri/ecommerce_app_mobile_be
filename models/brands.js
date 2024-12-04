const mongoose = require("mongoose");
const {Schema} = mongoose;

const brandSchema = new Schema ({
    name: {
        type: String ,
        trim: true
    },
    images:{
        type : String,
        trim: true
    },
    status:{
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const Brand = mongoose.model("Brand",brandSchema);
module.exports = Brand;