const mongoose = require("mongoose");
const {Schema} = mongoose;

const categoriesSchema = new Schema ({
    name: {
        type: String ,
        trim: true
    },
    images:{
        type : String,
        trim: true
    }
}, { timestamps: true });

const Categories = mongoose.model("Category",categoriesSchema);
module.exports = Categories;
