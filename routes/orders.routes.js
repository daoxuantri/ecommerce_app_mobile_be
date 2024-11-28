const orderController = require("../controllers/orders.controller");

const express = require("express");
const router = express.Router();

//tao don hang
router.post("/", orderController.createorder);
// router.post("/login", brandController.login);

//get all don hang 
router.get("/:iduser", orderController.getallorder);

// get theo status order
router.get("/:statusOrder/status", orderController.getorderonstatus)

//delete don hang -> trong tinh trang [progress]

router.delete("/:idOrder", orderController.deleteorder)


module.exports = router;    