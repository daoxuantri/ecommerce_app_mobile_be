const bannerController = require("../controllers/banners.controller");
const uploadCloud = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const express = require("express");
const router = express.Router();


//quảng cáo các chương trình khuyến mãi

//(role: admin , employee)
router.post("/create",uploadCloud.array('images'),  bannerController.createbanner);
router.put("/",uploadCloud.array('images'),  bannerController.updatebanner);


//all role
router.get("/",  bannerController.getallbanner);
router.get("/:id",  bannerController.getbannerbyid);

// //admin (sua lai role.verifyCation)
router.delete("/:id", bannerController.deletebanner);
module.exports = router;    