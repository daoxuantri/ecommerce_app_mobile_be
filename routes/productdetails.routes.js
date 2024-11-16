const productdetailController = require("../controllers/productdetails.controller");
const express = require("express");
const router = express.Router();


router.get("/:id",  productdetailController.getbyid);
router.post("/create",  productdetailController.createDetailProduct);


module.exports = router;    