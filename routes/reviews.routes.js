const reviewsController = require("../controllers/reviews.controller");

const express = require("express");
const router = express.Router();

router.post("/", reviewsController.createreview);
router.delete("/:reviewId", reviewsController.deletereview);
router.get("/:productId", reviewsController.getallreview);
router.get("/", reviewsController.getAllReview);
module.exports = router;    