const mongoose = require("mongoose");
const {Schema} = mongoose;

const employeeSchema = new Schema ({
    username:{
        type: String,
        trim : true ,
        
    },
    email:{
        type: String,
        required: true,
        trim: true ,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        trim: true ,

    },
    role: {
        type: String ,
        enum: ["admin", "employee", "manager"],
        default: "employee",
    },
    contact:{
        type: String,
        required: true,
        trim: true ,
    },
    images:{
        type: String , 
    },
},{ timestamps: true }
);
const Employee = mongoose.model("Employee",employeeSchema);
module.exports= Employee    