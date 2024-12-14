const cartController = require("../controllers/carts.controller");
const auth = require("../middlewares/auth");
const express = require("express");
const router = express.Router();

//duoc tao sau khi nguoi dung login lan dau tien vao

//dung test -> (ko dua vao)
router.post("/create", cartController.createcart); 

//chinh sua luong sp trong gio hang
router.put("/",auth.authenticateToken, cartController.addproduct); 

//xoa 1 sp 1 lan
router.post("/", auth.authenticateToken,cartController.removeproduct);

//xoa tat ca sp trong cart

router.post("/removeall",auth.authenticateToken, cartController.removeallproduct);

//find by user
router.get("/user",auth.authenticateToken, cartController.getcartbyuser); 

module.exports = router;    