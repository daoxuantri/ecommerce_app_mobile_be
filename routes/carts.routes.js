const cartController = require("../controllers/carts.controller");

const express = require("express");
const router = express.Router();

//duoc tao sau khi nguoi dung login lan dau tien vao

//dung test
router.post("/createcart", cartController.createcart); 

//role
router.get("/getcartbyuser/:id", cartController.getcartbyuser);
router.post("/addproduct", cartController.addproduct); 
router.post("/removeproduct", cartController.removeproduct);

module.exports = router;    