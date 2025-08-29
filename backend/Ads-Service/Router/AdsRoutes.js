const express = require("express");
const router = express.Router();

const { requireAuth, requireAdmin } = require("../Middleware/verifyToken");
const upload = require("../Middleware/upload");

const {
  getAds,
  getAdsAdmin,
  reviewAds,
  createAds,
  uploadTempFile,
  moveFileToPermanent,
  cleanupTempFile,
  getBookedRanges,
} = require("../Controller/AdsController");

router.get("/all", getAds);
router.get("/admin", requireAdmin, getAdsAdmin);
router.post("/create/:led", requireAuth, createAds);
router.put("/review/:adsId", requireAuth, reviewAds);

router.post("/upload-temp", requireAuth, upload.single("file"), uploadTempFile);
router.post("/move-to-permanent", moveFileToPermanent);
router.post("/cleanup-temp", cleanupTempFile);

router.get("/book-ranges", getBookedRanges);

module.exports = router;
