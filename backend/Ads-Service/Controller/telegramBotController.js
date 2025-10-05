const asyncHandler = require("express-async-handler");
const axios = require("axios");
const Ads = require("../Model/AdsModel");

const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL;

// ! Telegram Bot controller
const approvalAdsViaBot = asyncHandler(async (req, res) => {
  const { adsId } = req.params;
  try {
    const errorMessage = [];
    const { telegramUserId, reviewStatus } = req.body;

    // Validation form
    if (!telegramUserId) errorMessage.push("telegramUserId is required");
    if (!adsId) errorMessage.push("adsId is required");
    if (!reviewStatus) errorMessage.push("reviewStatus is required");
    if (!["approved", "rejected"].includes(reviewStatus))
      errorMessage.push("Invalid reviewStatus");

    if (errorMessage.length > 0) {
      return res.status(400).json({
        message: "Missing or invalid required fields",
        errors: errorMessage,
      });
    }

    const ad = await Ads.findById(adsId);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    ad.reviewStatus = reviewStatus;
    let refundData = null;

    if (reviewStatus === "rejected") {
      ad.billingStatus = "refunded";
      ad.status = "completed";

      // NOTE Calling refund
      try {
        const refundResponse = await axios.post(
          `${BILLING_SERVICE_URL}/api/wallets/telegram/deposit`,
          {
            amount: ad.totalCost,
            type: "refund",
            userId: ad.publisherId,
          },
          {
            headers: {
              "x-wallet-key": process.env.SECRET_WALLET_KEY,
            },
          }
        );

        if (refundResponse.data.success) {
          refundData = refundResponse.data;
        } else {
          refundData = null;
        }
      } catch (err) {
        console.log(
          "Refund error:",
          err.response ? err.response.data : err.message
        );
      }
    }

    await ad.save();

    return res.status(200).json({
      message: `Ad ${reviewStatus} via bot`,
      data: ad,
      refundData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve ads via bot",
      error: error.message,
    });
  }
});

module.exports = {
  approvalAdsViaBot,
};
