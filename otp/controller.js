const OTP = require("./model");
const generateOTP = require("../util/generateOTP");
const sendEmail = require("../util/sendEmail");
const User = require("../models/users");
const { hashData, verifyHashedData } = require("../util/hashData");
const {AUTH_EMAIL} = process.env;


const verifyOTP = async ({email , otp}) =>{
    try{
        if(!(email && otp)){
            throw Error("Provide values for email, otp");
        }
        //ensure otp record exists
        const matchedOTPRecord = await OTP.findOne({email});

        if(!matchedOTPRecord){
            throw Error("No otp records found");
        }

        const {expiresAt} = matchedOTPRecord;

        //checking for expired code
        if(expiresAt < Date.now()){
            await OTP.deleteOne({email});
            throw Error("Code has expired. Request for a new one.");
        }

        //not expired yet, verify value
        const hashedOTP = matchedOTPRecord.otp;
        const validOTP = await verifyHashedData(otp,hashedOTP);
        return validOTP;


        

    }catch(e){
        throw e;

    }
}

const sendOTP = async({email, subject, message, duration = 5}) =>{
    try{
        if(!(email && subject && message)){
            throw Error("Provide values for email, subject, message");
        }
        //clear any old record
        await OTP.deleteOne({email});


        //generate pin
        const generatedOTP = await generateOTP();
        
        //send email
        const mailOptions ={
            from : AUTH_EMAIL,
            to: email,
            subject, 
            html: `<p>${message}</p><p style="color:tomato; font-size:25px; letter-spacing:2px; "><b>${generatedOTP}</b></p><p>This code <b>expires in ${duration} hour(s)</b>.</p>`,
        }
        await sendEmail(mailOptions);

        //save otp record 
        const hashedOTP = await hashData(generatedOTP);
        const newOTP = await new OTP({
            email,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 360000 * + duration,
        });
        const createdOTPRecord = await newOTP.save();
        return createdOTPRecord;
    }catch(e){
        throw e;
    }
}

const deleteOTP = async (email) =>{
    try{
        await OTP.deleteOne({email});
    }catch(e){
        throw e;
    }
}




///////////////////////////////////////////////////////

const sendVerificationOTPEmail = async (email) => {
    try{
        //check if an account exists
        const existingUser = await User.findOne({email});
        if(!existingUser){
            throw Error("There's no account for the provided email.");

        }

        const otpDetails ={
            email,
            subject: "Email Verification",
            message: "Verify your email with the code below.",
            duration: 1,
        };

        const createdOTP = await sendOTP(otpDetails);
        return createdOTP;


    }catch(e){
        throw e;
    }
}

const verifyUserEmail = async ({email, otp})=>{
    try{
        const validOTP = await verifyOTP({email, otp});
        if(!validOTP){
           return Error('kiem tr ahop thaoi');
        }
        await deleteOTP(email);
        return ;
    }catch(e){
        throw e;
    }
}

module.exports = { sendOTP, verifyOTP , sendVerificationOTPEmail, verifyUserEmail, deleteOTP};