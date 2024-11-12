const cartController = require("../controllers/carts.controller");

const express = require("express");
const router = express.Router();

//duoc tao sau khi nguoi dung login lan dau tien vao

//dung test
// router.post("/create", cartController.createcart); 


router.put("/", cartController.addproduct); 
router.delete("/", cartController.removeproduct);

module.exports = router;    