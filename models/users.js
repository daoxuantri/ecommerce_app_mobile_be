const mongoose = require("mongoose");
const {Schema} = mongoose;

const userSchema = new Schema ({
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
    contact:{
        type: String,
        required: true,
        trim: true ,
    },
    images:{
        type: String , 
    },
    bonuspoint:{
        type: Number,
        default: 0
    },
    status: {
        type : Boolean, 
        default : true
    }
},{ timestamps: true }
);


// //return Json
// userSchema.set("toJSON",{
//     transform: (document , returnedObject)=>{
//         returnedObject.id = returnedObject._id.toString();
//         delete returnedObject._id;
//         delete returnedObject.__v;
//         delete returnedObject.password;
//         delete returnedObject.createdAt;
//         delete returnedObject.updatedAt;
//         delete returnedObject.contact;
// Middleware để xóa các bản ghi liên quan          
        
        

//     },
// });
const User = mongoose.model("User",userSchema);
module.exports= User    