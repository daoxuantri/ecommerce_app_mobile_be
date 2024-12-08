const categoryController = require("../controllers/categories.controller");

const express = require("express");
const router = express.Router();
const uploadCloud = require("../middlewares/multer");
const auth = require("../middlewares/auth");

//all role
router.get("/",  categoryController.getallcategories);
router.get("/:id",  categoryController.getcatebyid);
//admin , employee
router.post("/create",uploadCloud.array('images'),  categoryController.createcategories);


//admin
router.delete("/:id",auth.verifyTokenAndAdmin, categoryController.deletecategory);

//get all product (category)
router.get("/:id/products",  categoryController.getallproduct);


//dung cho flutter
router.get("/:id/productsflutter",  categoryController.getallproductflutter);

//get filter options for category
router.get("/:id/filters", categoryController.getFilterOptions);

//get brands options for category
router.get("/:id/brands", categoryController.getAllBrand);
module.exports = router;    