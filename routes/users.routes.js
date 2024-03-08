const userController = require("../controllers/users.controller");

const express = require("express");
const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);



const {sendOTP, verifyOTP, sendVerificationOTPEmail} = require("../otp/controller");


router.post("/verify", async (req,res) =>{
    try{
        let { email, otp} = req.body;
        const validOTP = await verifyOTP({email, otp});
        return res.status(200).json({valid: validOTP});

    }catch(e){
        res.status(400).send(e.message);
    }
});

router.post("/forgotpass", async (req, res)=>{
    try{
        const {email, subject, message, duration} = req.body;

        const createdOTP = await sendOTP({
            email,
            subject,
            message,
            duration,
        }); 
        console.log(createdOTP);
        return res.status(200).json(createdOTP);
       

    }
    catch(e){
        res.status(400).send(e.message);
    }
});

router.post("/email_verification", async (req, res)=>{
    try{
        const {email} = req.body; 
        if (!email) throw Error("An email is required!");

        const createdEmailVerificationOTP = await sendVerificationOTPEmail(email);

        return res.status(200).json(createdEmailVerificationOTP);


       

    }
    catch(e){
        res.status(400).send(e.message);
    }
});




module.exports = router;