const reviewsController = require("../controllers/reviews.controller");
const auth = require("../middlewares/auth");
const express = require("express");
const router = express.Router();

router.post("/",auth.authenticateToken,reviewsController.createreview);

//Delete review(quyen admin)
router.delete("/:reviewId", reviewsController.deletereview);
router.get("/:productId", reviewsController.getallreview);
router.get("/", reviewsController.getAllReview);
module.exports = router;    