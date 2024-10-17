const mongoose = require("mongoose");
const {Schema} = mongoose;

const bannerSchema = new Schema ({
    name: {
        type: String ,
        trim: true
    },
    images:{
        type : String,
        trim: true
    },
    description: {
        type : String ,
        trim : true
    }
}, { timestamps: true });

const Banner = mongoose.model("Banner",bannerSchema);
module.exports = Banner;
