const employeeController = require("../controllers/employees.controller");
const express = require("express");
const router = express.Router();
const Employee = require("../models/employees"); 
const OTP = require("../otp/model");
const auth = require("../middlewares/auth");
const uploadCloud = require("../middlewares/multer");
//các function dùng để resetpass
const {sendOTP, verifyOTP, sendVerificationOTPEmail, deleteOTP} = require("../otp/controller");
const { verifyHashedData } = require("../util/hashData");


// chỉ có admin mới tạo acc cho user
//(role admin)
router.post("/register",employeeController.register);
router.post("/login", employeeController.login);

router.get("/products", employeeController.getProducts);
router.get("/products/sales", employeeController.getProductsOnSales);
router.post("/products", uploadCloud.array('images'),employeeController.createProduct);
router.get("/products/:productId",employeeController.getProductById);

router.get("/brands", employeeController.getBrands);
router.get("/categories", employeeController.getCategories);
router.get("/users", employeeController.getUsers);
router.get("/staffs", employeeController.getEmployees);
router.get("/orders", employeeController.getOrders);

router.delete("/:id", employeeController.deleteStaff);
router.put("/:id",uploadCloud.array('images'), employeeController.updateStaff);
//resetpass-employee
router.post("/getempbyid/:id",employeeController.getempbyid);
router.get("/resetpass",employeeController.resetpass);
//send email
router.post("/email_verification/:email", async (req, res) => {
    try {
        const { email } = req.params;
        
        const checkEmail = await Employee.findOne({email});
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

//xac thuc OTP
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





module.exports = router;