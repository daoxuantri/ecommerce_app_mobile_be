const bannerController = require("../controllers/banners.controller");
const uploadCloud = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const express = require("express");
const router = express.Router();


//quảng cáo các chương trình khuyến mãi

//(role: admin , employee)
router.post("/createbanner",uploadCloud.array('images'),  bannerController.createbanner);
router.post("/updatebanner",uploadCloud.array('images'),  bannerController.updatebanner);


//all role
router.get("/getallbanner",  bannerController.getallbanner);
router.get("/getbannerbyid",  bannerController.getbannerbyid);

// //admin (sua lai role.verifyCation)
router.delete("/deletebanner/:id",auth.verifyTokenAndAdmin, bannerController.deletebanner);
module.exports = router;    