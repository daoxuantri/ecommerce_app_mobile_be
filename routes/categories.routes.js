const categoryController = require("../controllers/categories.controller");

const express = require("express");
const router = express.Router();
const uploadCloud = require("../middlewares/multer");
const auth = require("../middlewares/auth");

//all role
router.get("/getallcategories",  categoryController.getallcategories);
//admin , employee
router.post("/createcategories",uploadCloud.array('images'),  categoryController.createcategories);
//admin
router.delete("/deletecategory/:id",auth.verifyTokenAndAdmin, categoryController.deletecategory);
module.exports = router;    