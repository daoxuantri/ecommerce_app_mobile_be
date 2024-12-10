const variantController = require("../controllers/variants.controller");
const express = require("express");
const router = express.Router();

//all role
router.post("/create",  variantController.createvariant);
// router.get("/:id",  variantController.getbannerbyid);
// Cập nhật một variant cụ thể
router.put('/:variantId', variantController.updateVariants);
// // //admin (sua lai role.verifyCation)
// router.delete("/:id",auth.verifyTokenAndAdmin, variantController.deletebanner);
module.exports = router;    