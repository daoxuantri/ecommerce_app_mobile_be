const brandController = require("../controllers/brands.controller");
const express = require("express");
const router = express.Router();
const uploadCloud = require("../middlewares/multer");
const auth = require("../middlewares/auth");


//role (admin , employee)
router.post("/create", uploadCloud.array('images'), brandController.createbrand);

router.get("/",  brandController.getallbrand);
router.get("/:id",  brandController.getbrandbyid);
router.get("/:id/products",  brandController.getallproduct);

//(Xem bo sung => ko can thiet thi bo)
router.delete("/:id", brandController.deletebrand);



module.exports = router;    