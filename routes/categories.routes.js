const categoryController = require("../controllers/categories.controller");

const express = require("express");
const router = express.Router();
const uploadCloud = require("../middlewares/multer");
const auth = require("../middlewares/auth");

//all role
router.get("/getallcategories",  categoryController.getallcategories);
router.get("/getcatebyid/:id",  categoryController.getcatebyid);
//admin , employee
router.post("/createcategories",uploadCloud.array('images'),  categoryController.createcategories);
//admin
router.delete("/deletecategory/:id",auth.verifyTokenAndAdmin, categoryController.deletecategory);
//get all product (category)
router.get("/getallproduct/:id",  categoryController.getallproduct);
module.exports = router;    