const mongoose = require("mongoose");
const {Schema} = mongoose;

const categoriesSchema = new Schema ({
    cat_title: {
        type: String ,
        trim: true
    }
}, { timestamps: true });

const Categories = mongoose.model("Category",categoriesSchema);
module.exports = Categories;
