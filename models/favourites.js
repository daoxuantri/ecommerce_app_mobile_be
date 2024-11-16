const mongoose = require("mongoose");
const {Schema} = mongoose;

const favouriteSchema = new Schema ({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        
    },
    productItem:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    }
    ],
},{ timestamps: true }
);

const Favourite = mongoose.model("Favourite",favouriteSchema);
module.exports= Favourite    