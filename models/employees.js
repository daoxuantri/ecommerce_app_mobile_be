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
    contact:{
        type: String,
        required: true,
        trim: true ,
    },
    images:{
        type: String , 
    },
    role: {
        type: String,
        enum: ['admin', 'employee'],  
        default: 'employee', 
      },
},{ timestamps: true }
);


//return Json
employeeSchema.set("toJSON",{
    transform: (document , returnedObject)=>{
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.password;
        delete returnedObject.createdAt;
        delete returnedObject.updatedAt;
        delete returnedObject.contact;
            
        
        

    },
});
const Employee = mongoose.model("Employee",employeeSchema);
module.exports= Employee    