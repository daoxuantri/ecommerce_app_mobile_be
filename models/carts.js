const mongoose = require("mongoose");
const {Schema} = mongoose;
const cartSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        ref: "User"
    },
    productItem: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                require: true,
                ref: "Product"
            },
            name: { type: String, require: true },
            quantity: { type: Number, require: true },
            images: { type: String, require: false },
            price: { type: Number, require: true },
            memory: { type: String, required: false }, // Thêm dung lượng
            color: { type: String, required: false }, // Thêm màu sắc
        }
    ],
    total: {
        type: Number,
        required: true,
        default: 0.0
    }
},
    { timestamps: true }
);

const Cart = mongoose.model("Cart",cartSchema);
module.exports= Cart;