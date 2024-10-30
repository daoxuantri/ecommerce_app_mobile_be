const mongoose = require("mongoose");
const {Schema} = mongoose;


const paymentMethods = ['PAYPAL', 'COD'];
const billSchema = new Schema ({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Order',
    },
    billCode: {
        type: String ,
        trim: true
    },
    total:{
        type : Number, 
    },
    paymentMethod: {
        type: String,
        enum: paymentMethods,   
        required: true,   
        trim: true
    }

}, { timestamps: true });

const Bill = mongoose.model("Bill",billSchema);
module.exports = Bill;