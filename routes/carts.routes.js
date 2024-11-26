const cartController = require("../controllers/carts.controller");

const express = require("express");
const router = express.Router();

//duoc tao sau khi nguoi dung login lan dau tien vao

//dung test
router.post("/create", cartController.createcart); 

//chinh sua luong sp trong gio hang
router.put("/", cartController.addproduct); 

//xoa 1 sp 1 lan
router.post("/", cartController.removeproduct);

//xoa tat ca sp trong cart

router.post("/removeall", cartController.removeallproduct);

//find by user
router.get("/:id/user", cartController.getcartbyuser); 

module.exports = router;    