const productController = require("../controllers/products.controller");
const uploadCloud = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const express = require("express");
const router = express.Router();

//all role
router.post("/createproduct",uploadCloud.array('images'),  productController.createproduct);
router.post("/updateproduct",  productController.updateproduct);
router.get("/getallproduct",  productController.getallproduct);


// //admin
// router.delete("/deleteproduct/:id",auth.verifyTokenAndAdmin, productController.deleteproduct);
module.exports = router;    