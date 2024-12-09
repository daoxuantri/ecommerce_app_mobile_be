const mongoose = require("mongoose");
const {Schema} = mongoose;



const orderStatus = ['PROGRESS','DELIVERY', 'COMPLETED', 'CANCELED'];
const orderSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            ref: 'User',
        },
        productItem: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    require: true,
                    ref: 'Product',
                },
                name: { type: String  },
                quantity: { type: Number},
                images: { type: String, require: false },
                price: { type: Number, },
                memory: {type: String, required : false},
                color:{type: String , required: false}

            },
        ],
        orderStatus: {
            type: String,
            enum: orderStatus,
            default: 'PROGRESS'
        },
        infomationUser: {
            address: { type: String, required: true }, 
            phone: { type: String, required: true }, 
            name: { type: String, required: true } 
        },
        paid: {
            type: Boolean, 
            default : false
        },
        total: {
            type: Number,
            required: true,
            default: 0.0,
        }
    },
    { timestamps: true },
);

const Order = mongoose.model("Order",orderSchema);
module.exports= Order;