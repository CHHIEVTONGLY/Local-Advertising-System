const express = require("express");
const router = express.Router();

const {
  getPricing,
  updatePricing,
} = require("../Controller/PricingController");

router.get("/:pricingId", getPricing);

router.patch("/:pricingId", updatePricing);

module.exports = router;
