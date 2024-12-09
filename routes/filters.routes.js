const filterController = require("../controllers/filters.controller");

const express = require("express");
const router = express.Router();
router.put("/",  filterController.updateFilterById);
router.get("/", filterController.getFilters);
router.post("/:id", filterController.updateFilterById);
//admin , employee
router.post("/create",  filterController.createFilter);
//admin
router.delete("/:id", filterController.deleteFilterById);

module.exports = router;    