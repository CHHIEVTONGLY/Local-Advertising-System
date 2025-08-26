const express = require("express");
const router = express.Router();

const {
  getLEDs,
  createLED,
  updateLED,
  deleteLED,
} = require("../Controller/LEDsController");

const { requireAdmin } = require("../Middleware/verifyToken");

router.get("/all", getLEDs);

router.post("/create", requireAdmin, createLED);

router.put("/update/:id", requireAdmin, updateLED);

router.delete("/delete/:id", requireAdmin, deleteLED);

module.exports = router;
