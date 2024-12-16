const filterController = require("../controllers/filters.controller");

const express = require("express");
const router = express.Router();
router.get("/", filterController.getFilters);
router.put("/:id", filterController.updateFilterById);
//admin , employee
router.post("/create",  filterController.createFilter);
//admin
router.delete("/:id", filterController.deleteFilterById);

module.exports = router;    