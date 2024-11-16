const favouriteController = require("../controllers/favourites.controller");
const express = require("express");
const router = express.Router();

//(role: admin , employee)
router.post("/create",  favouriteController.createfavourite);

module.exports = router;