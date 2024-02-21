const mongoose = require("mongoose");
const {Schema} = mongoose;

const saleSchema = new Schema ({
    sale_name: {
        type: String ,
        require: true,
        trim: true
    },
    sale_des: {
        type: String ,
        require: true,
        trim: true
    },
    sale_image:{
        type : String,
        require: true
    }
}, { timestamps: true });

const Sale = mongoose.model("Sale",saleSchema);
module.exports = Sale;