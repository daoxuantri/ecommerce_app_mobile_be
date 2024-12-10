const productController = require("../controllers/products.controller");
const uploadCloud = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const express = require("express");
const router = express.Router();

//(role: admin , employee)
router.post("/create",uploadCloud.array('images'),  productController.createproduct);
router.put("/",uploadCloud.array('images'), productController.updateproduct);

//sort and filter ( brand , rating , keyname , price)
router.get("/sort", productController.sort);
//all role
router.get("/", productController.getallproduct);
router.get("/home",  productController.getall);
//flutter
router.get("/homeflutter",  productController.getallflutter);

router.delete("/:productId", productController.deleteProduct);

//get list sp lien quan 
router.get("/:id/listallproduct",  productController.listallproduct);
//get list sp lien quan cho website
router.get("/:id/relatedproduct", productController.getRelatedProducts);

router.get("/search", productController.searchProduct);

router.get("/:id", productController.getproductbyid);







// getallproduct , topselling , newproduct => client, user
// router.get("/allhome",  productController.getall);
//route get product (category) -> client , user

// //admin
router.delete("/:id",auth.verifyTokenAndAdmin, productController.deleteproduct);
module.exports = router;    