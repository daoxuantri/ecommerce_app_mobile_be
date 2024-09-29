const mongoose = require("mongoose");
const {Schema} = mongoose;

const brandSchema = new Schema ({
    name: {
        type: String ,
        trim: true
    }
}, { timestamps: true });

const Brand = mongoose.model("Brand",brandSchema);
module.exports = Brand;