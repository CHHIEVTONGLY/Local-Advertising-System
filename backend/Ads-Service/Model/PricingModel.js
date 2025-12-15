const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PricingSchema = new Schema({
  basePrice: { type: Number, required: true, default: 5 },
  primeMultiplier: { type: Number, default: 1.5 },
  weekendMultiplier: { type: Number, default: 1.2 },
  offPeakMultiplier: { type: Number, default: 0.7 },
  primeHours: { type: [Number], default: [17, 18, 19] }, // 5–8 PM
});

const Pricing = mongoose.model("Pricing", PricingSchema);
module.exports = Pricing;
