const orderController = require("../controllers/orders.controller");
const auth = require("../middlewares/auth");
const express = require("express");
const router = express.Router();

//tao don hang
router.post("/", auth.authenticateToken,orderController.createorder);
// router.post("/login", brandController.login);

//admin (statisticProduct -> quyen admin)
router.get("/statisticProduct",orderController.statisticProduct);

//get all don hang 
router.get("/",auth.authenticateToken, orderController.getallorder);
router.get("/statistic", orderController.getStatisticsDetails),
router.delete("/:orderId", auth.authenticateTokenAdmin,orderController.deleteOrder);
router.put("/:orderId", auth.authenticateTokenAdmin, orderController.updateOrder);
router.get("/:orderId", auth.authenticateTokenAdmin, orderController.getOrderById);
// get theo status order
router.get("/:statusOrder/status", auth.authenticateToken,orderController.getorderonstatus)

//delete don hang -> trong tinh trang [progress]



router.put("/:orderId/cancel", auth.authenticateToken, orderController.cancelOrder);

//thong ke top 10 sp ban chay (user hoan thanh xong don hang)


module.exports = router;    