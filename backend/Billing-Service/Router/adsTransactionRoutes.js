const express = require("express");
const router = express.Router();

const {
  createAdsTransaction,
  getTransactionsByUser,
} = require("../Controller/adsTransactioncontroller");

router.post("/create", createAdsTransaction);
router.get("/me", getTransactionsByUser);

module.exports = router;
