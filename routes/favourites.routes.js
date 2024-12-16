const favouriteController = require("../controllers/favourites.controller");
const express = require("express");
const router = express.Router();

//(role: admin , employee)
router.post("/create",  favouriteController.createfavourite);
router.put("/", favouriteController.updateProductId);
router.get("/products/:userId", favouriteController.getFavouriteProducts);
module.exports = router;