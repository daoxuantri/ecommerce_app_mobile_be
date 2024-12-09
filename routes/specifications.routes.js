const specificationsController = require("../controllers/specifications.controller");
const express = require("express");
const router = express.Router();


router.get("/:id",  specificationsController.getbyid);
router.post("/create",  specificationsController.createDetailProduct);
router.put("/:productId", specificationsController.updateSpecifications);

module.exports = router;    