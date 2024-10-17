const mongoose = require("mongoose");
const {Schema} = mongoose;
const couponSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "User"
    },
    total: {
        type: Number,
        required: true,
        default: 0.0
    }
},
    { timestamps: true }
)
const Coupon = mongoose.model("Coupon",couponSchema);
module.exports= Coupon;