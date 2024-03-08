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
    country:{
        type: String,
        trim: true,

    },
    contact:{
        type: String,
        required: true,
        trim: true ,
    },
    address:{
        type: String,
        trim: true ,
    },
    images:{
        type: String , 
    },
    role : {
        type: Boolean, 
        default : false,
    }
},{ timestamps: true }
);


//return Json
userSchema.set("toJSON",{
    transform: (document , returnedObject)=>{
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.password;
        delete returnedObject.createdAt;
        delete returnedObject.updatedAt;
        
        

    },
});
const User = mongoose.model("User",userSchema);
module.exports= User;