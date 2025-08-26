const express = require("express");
const router = express.Router();

const { requireAuth, requireAdmin } = require("../Middleware/verifyToken");

const {
  getAds,
  getAdsAdmin,
  reviewAds,
  createAds,
} = require("../Controller/AdsController");

router.get("/all", getAds);
router.get("/admin", requireAdmin, getAdsAdmin);
router.post("/create/:led", requireAuth, createAds);
router.put("/review/:adsId", requireAuth, reviewAds);

module.exports = router;
