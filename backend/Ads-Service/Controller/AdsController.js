const Ads = require("../Model/AdsModel");
const asyncHandler = require("express-async-handler");
const s3 = require("../utils/s3");

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

const uploadTempFile = asyncHandler(async (req, res) => {
  const file = req.file;
  const user = req.user.id;
  if (!file) return res.status(400).send("No file uploaded");
  if (!user) return res.status(400).send("No user found");

  // Generate unique tempKey for tracking
  const timestamp = Date.now();
  const tempKey = `tmp-uploads/${user}/${timestamp}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: tempKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentDisposition: "inline",
    Metadata: {
      uploadedBy: user,
      originalName: file.originalname,
      uploadTimestamp: timestamp.toString(),
    },
  };

  try {
    const data = await s3.upload(params).promise();

    res.status(200).send({
      message: "Successfully uploaded temporary file",
      tempKey,
      fileUrl: data.Location,
      metadata: {
        userId: user,
        originalName: file.originalname,
        timestamp,
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send({ message: err.message });
  }
});

// New controller to move file from temp to permanent after payment
const moveFileToPermanent = asyncHandler(async (req, res) => {
  try {
    const { tempKey, fileName, orderId, sessionId } = req.body;

    console.log("📋 Received move request:", {
      tempKey,
      fileName,
      orderId,
      sessionId,
    });

    if (!tempKey || !fileName) {
      return res.status(400).json({
        message: "Missing required fields: tempKey, fileName",
      });
    }

    console.log("📁 Moving file from temp to permanent:", tempKey);
    console.log("🔧 Environment check:", {
      bucket: process.env.AWS_BUCKET_NAME,
      region: process.env.AWS_REGION,
      hasAwsKey: !!process.env.AWS_ACCESS_KEY,
      hasAwsSecret: !!process.env.AWS_SECRET_KEY,
    });

    const timestamp = Date.now();
    const permanentKey = `ads/${timestamp}-${orderId || "order"}-${fileName}`;

    console.log("🎯 Target permanent key:", permanentKey);

    const copyParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      CopySource: `${process.env.AWS_BUCKET_NAME}/${tempKey}`,
      Key: permanentKey,
      MetadataDirective: "REPLACE",
      ContentType: getContentType(fileName),
      ContentDisposition: "inline",
      Metadata: {
        movedAt: timestamp.toString(),
        orderId: orderId || "",
        sessionId: sessionId || "",
        originalTempKey: tempKey,
      },
    };

    console.log("📋 Copy parameters:", copyParams);

    // Test if the source file exists first
    console.log("🔍 Checking if source file exists...");
    try {
      await s3
        .headObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: tempKey,
        })
        .promise();
      console.log("✅ Source file exists");
    } catch (headError) {
      console.error("❌ Source file does not exist:", headError.message);
      return res.status(404).json({
        message: "Source file not found",
        tempKey,
        error: headError.message,
      });
    }

    console.log("🔄 Starting copy operation...");
    await s3.copyObject(copyParams).promise();
    console.log("✅ File copied successfully");

    console.log("🗑️ Deleting temporary file...");
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: tempKey,
    };

    await s3.deleteObject(deleteParams).promise();
    console.log("✅ Temporary file deleted");

    const permanentUrl = `https://${process.env.AWS_BUCKET_NAME}.s3-${process.env.AWS_REGION}.amazonaws.com/${permanentKey}`;

    console.log("✅ File moved successfully to:", permanentUrl);

    res.status(200).json({
      message: "File moved to permanent location successfully",
      mediaUrl: permanentUrl,
      permanentKey,
      orderId,
      sessionId,
    });
  } catch (error) {
    console.error("❌ Error moving file:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
    });

    res.status(500).json({
      message: "Failed to move file to permanent location",
      error: error.message,
      code: error.code,
      tempKey: req.body.tempKey,
    });
  }
});

// Optional: Clean up temp file (for failed payments)
const cleanupTempFile = asyncHandler(async (req, res) => {
  try {
    const { tempKey } = req.body;

    if (!tempKey) {
      return res.status(400).json({
        message: "Missing required field: tempKey",
      });
    }

    console.log("🗑️ Cleaning up temp file:", tempKey);

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: tempKey,
    };

    await s3.deleteObject(deleteParams).promise();

    console.log("✅ Temp file deleted successfully");

    res.status(200).json({
      message: "Temporary file deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting temp file:", error);
    res.status(500).json({
      message: "Failed to delete temporary file",
      error: error.message,
    });
  }
});

function getContentType(fileName) {
  const ext = fileName.toLowerCase().split(".").pop();
  const contentTypes = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",

    // Videos
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    webm: "video/webm",
    mkv: "video/x-matroska",

    // Default
    default: "application/octet-stream",
  };

  return contentTypes[ext] || contentTypes.default;
}

module.exports = {
  getAds,
  getAdsAdmin,
  reviewAds,
  createAds,
  uploadTempFile,
  moveFileToPermanent,
  cleanupTempFile,
};
