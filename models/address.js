const mongoose = require("mongoose");
const {Schema} = mongoose;

const addressSchema = new Schema ({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User',
    },
    location :[
        {
            address: {type : String },
            status: {type : Boolean , default : false},
            phone: {type : String},
            name: {type : String}
        }
    ]
}, { timestamps: true });

const Address = mongoose.model("Address",addressSchema);
module.exports = Address;
