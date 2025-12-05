const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LedSchema = new Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  screenSize: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^[1-9]\d{1,5}x[1-9]\d{1,5}$/i.test(v),
      message: "screenSize must be like 1920x1080",
    },
  },
  status: { type: String, enum: ["active", "maintenance"], default: "active" },
  pricing: { type: Schema.Types.ObjectId, ref: "Pricing" },
});

const Led = mongoose.model("Led", LedSchema);
module.exports = Led;
