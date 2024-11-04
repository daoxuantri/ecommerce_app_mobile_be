const productController = require("../controllers/products.controller");
const uploadCloud = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const express = require("express");
const router = express.Router();

//(role: admin , employee)
router.post("/createproduct",uploadCloud.array('images'),  productController.createproduct);
router.post("/updateproduct",uploadCloud.array('images'), productController.updateproduct);
//sort and filter
router.get("/sort", productController.sort);
//all role
router.get("/getallproduct",  productController.getallproduct);
router.get("/getproductbyid/:id", productController.getproductbyid);
// //admin
router.delete("/deleteproduct/:id",auth.verifyTokenAndAdmin, productController.deleteproduct);
module.exports = router;    