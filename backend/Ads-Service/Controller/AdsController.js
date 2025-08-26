const Ads = require("../Model/AdsModel");
const asyncHandler = require("express-async-handler");

const getAds = asyncHandler(async (req, res) => {
  try {
    const {
      q,
      ownerId,
      page = "1",
      limit = "20",
      sort = "-createdAt",
    } = req.query;

    const filter = {};
    filter.reviewStatus = "approved";
    if (q) filter.title = { $regex: String(q), $options: "i" };
    if (ownerId) filter.ownerId = ownerId;

    // Only include ads that start now or in the future
    const now = new Date();
    filter["displayTime.startTime"] = { $gte: now };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Ads.find(filter).sort(sort).skip(skip).limit(limitNum),
      Ads.countDocuments(filter),
    ]);

    res.status(200).send({
      message: "OK",
      data,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

const getAdsAdmin = asyncHandler(async (req, res) => {
  try {
    const {
      q,
      status,
      ownerId,
      page = "1",
      limit = "20",
      sort = "-createdAt",
    } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.title = { $regex: String(q), $options: "i" };
    if (ownerId) filter.ownerId = ownerId;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Ads.find(filter).sort(sort).skip(skip).limit(limitNum),
      Ads.countDocuments(filter),
    ]);

    res.status(200).send({
      message: "OK",
      data,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

const createAds = asyncHandler(async (req, res) => {
  try {
    const { led } = req.params;
    const {
      mediaUrl,
      type = "image",
      duration,
      displayTime,
      pricePerSecond,
      status = "draft",
      totalCost,
    } = req.body;
    const publisherId = req.user.id;

    if (
      !mediaUrl ||
      !duration ||
      !displayTime?.startTime ||
      !displayTime?.endTime ||
      !pricePerSecond
    ) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    const startTime = new Date(displayTime.startTime);
    const endTime = new Date(displayTime.endTime);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      return res.status(400).send({ message: "Invalid startTime or endTime" });
    }
    if (endTime <= startTime) {
      return res
        .status(400)
        .send({ message: "endTime must be after startTime" });
    }

    // Conflict check
    const conflict = await Ads.findOne({
      led,
      reviewStatus: "approved",
      $or: [
        {
          "displayTime.startTime": { $lt: endTime },
          "displayTime.endTime": { $gt: startTime },
        },
      ],
    });

    if (conflict) {
      return res
        .status(400)
        .send({ message: "Time slot conflicts with another ad on this LED" });
    }

    const ad = await Ads.create({
      publisherId,
      led,
      mediaUrl,
      type,
      duration,
      displayTime: { startTime, endTime },
      pricePerSecond,
      status,
      totalCost:
        typeof totalCost === "number" ? totalCost : duration * pricePerSecond,
      reviewStatus: "approved",
    });

    res.status(201).send({ message: "Created", data: ad });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

const reviewAds = asyncHandler(async (req, res) => {
  try {
    const { adsId } = req.params;
    const { reviewStatus } = req.body;

    const ad = await Ads.findById(adsId);
    if (!ad) return res.status(404).send({ message: "Ad not found" });

    if (!["approved", "rejected"].includes(reviewStatus)) {
      return res.status(400).send({ message: "Invalid status" });
    }

    ad.reviewStatus = reviewStatus;
    await ad.save();

    res.status(200).send({ message: "Ad reviewed successfully", data: ad });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

module.exports = { getAds, getAdsAdmin, reviewAds, createAds };
