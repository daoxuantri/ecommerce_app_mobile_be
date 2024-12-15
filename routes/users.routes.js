const userController = require("../controllers/users.controller");
const uploadCloud = require("../middlewares/multer");
const express = require("express");
const router = express.Router();
const User = require("../models/users");
const OTP = require("../otp/model");
const auth = require("../middlewares/auth");

//all role
router.post("/register", userController.register);

router.post("/login", userController.login);

router.post("/resetpass", userController.resetpass);
router.put("/:id",uploadCloud.array('images'), userController.updateUser);

router.delete('/:id', userController.deleteUser);
router.get("/:id", userController.getuserbyid);

router.get("/:id/cart", userController.getcartbyuser);

//test token ---(Trí)
router.post("/logintoken", userController.logintoken);

const {sendOTP, verifyOTP, sendVerificationOTPEmail, deleteOTP} = require("../otp/controller");
const { verifyHashedData } = require("../util/hashData");


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

router.post("/email_verification/:email", async (req, res) => {
    try {
        const { email } = req.params;
        
        const checkEmail = await User.findOne({email});
        if(!checkEmail){
            return res.status(401).send(
                {success: false,
                message: 'Tài khoản không tồn tại'}
            );
        }
        if(!checkEmail.status){
            return res.status(401).send(
                {success: false,
                message: 'Tài khoản của bạn đã bị khóa , vui lòng liên hệ CSKH'}
            );
        }
        if (!email) throw Error("An email is required!");

        const createdEmailVerificationOTP = await sendVerificationOTPEmail(email);

        return res.status(200).json(createdEmailVerificationOTP);
    } catch(e) {
        res.status(400).send(e.message);
    }
});

router.post("/verify1", async (req,res) =>{
    try{
        let {email, otp} = req.body;
        if(!(email && otp)){
            return res.status(400).json({success: false , message:'Kiểm tra lại email , otp của bạn'});
        }
        //ensure otp record exists
        const matchedOTPRecord = await OTP.findOne({email});
        if(!matchedOTPRecord){
            return res.status(400).json({success: false , message:'OTP hết hạn. Tạo một yêu cầu mới'});
        }

        const {expiresAt} = matchedOTPRecord;

        //checking for expired code
        if(expiresAt < Date.now()){
            await OTP.deleteOne({email});
            return res.status(400).json({success: false , message:'OTP hết hạn. Tạo một yêu cầu mới'});
        }

        //not expired yet, verify value
        const hashedOTP = matchedOTPRecord.otp;
        const validOTP = await verifyHashedData(otp,hashedOTP);
        
        if(!validOTP){
            return res.status(400).json({success: false , message:'OTP không đúng. Vui lòng kiểm tra lại'});
        }
        await deleteOTP(email);
        return res.status(200).json({success: true , message:'Thành công'});



    }catch(e){
        res.status(400).json({success: false, message: e.message});
    }
});

module.exports = router;