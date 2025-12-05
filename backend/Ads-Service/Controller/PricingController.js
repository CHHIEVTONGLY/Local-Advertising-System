const PricingModel = require("../Model/PricingModel");
const asyncHandler = require("express-async-handler");

const getPricing = asyncHandler(async (req, res) => {
  const { pricingId } = req.params;

  const pricing = await PricingModel.findById(pricingId);
  if (!pricing) {
    return res.status(404).send("Pricing not found");
  }

  res.status(200).send(pricing);
});

const updatePricing = asyncHandler(async (req, res) => {
  const { pricingId } = req.params;
  const fieldToUpdate = {};

  if (!pricingId) {
    return res.status(400).send("pricingId is required");
  }

  if (req.body.basePrice && !isNaN(req.body.basePrice))
    fieldToUpdate.basePrice = Number(req.body.basePrice);

  if (req.body.primeMultiplier && !isNaN(req.body.primeMultiplier))
    fieldToUpdate.primeMultiplier = Number(req.body.primeMultiplier);

  if (req.body.weekendMultiplier && !isNaN(req.body.weekendMultiplier))
    fieldToUpdate.weekendMultiplier = Number(req.body.weekendMultiplier);

  if (req.body.offPeakMultiplier && !isNaN(req.body.offPeakMultiplier))
    fieldToUpdate.offPeakMultiplier = Number(req.body.offPeakMultiplier);

  // ! Prime hours should be an array of numbers hours using 24-hour format
  if (req.body.primeHours && Array.isArray(req.body.primeHours)) {
    fieldToUpdate.primeHours = req.body.primeHours.map(Number);
  }

  // If no field to update is provided
  if (Object.keys(fieldToUpdate).length === 0) {
    return res.status(400).send("No valid fields to update");
  }

  const pricing = await PricingModel.findByIdAndUpdate(
    pricingId,
    fieldToUpdate,
    { new: true }
  );

  if (!pricing) return res.status(404).send("Pricing not found");

  res.status(200).json({ message: "Successfully updated!", data: pricing });
});

module.exports = { getPricing, updatePricing };
