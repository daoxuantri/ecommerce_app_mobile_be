const variantController = require("../controllers/variants.controller");
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
//all role
router.post("/create", auth.authenticateTokenAdmin, variantController.createvariant);
// router.get("/:id",  variantController.getbannerbyid);
// Cập nhật một variant cụ thể
router.put('/', auth.authenticateTokenAdmin,variantController.updateVariants);
router.delete('/:variantId', auth.authenticateTokenAdmin,variantController.deleteVariant);
// // //admin (sua lai role.verifyCation)
// router.delete("/:id",auth.verifyTokenAndAdmin, variantController.deletebanner);
module.exports = router;    