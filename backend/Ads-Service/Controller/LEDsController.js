const LEDModel = require("../Model/LEDModel");
const asyncHandler = require("express-async-handler");

const getLEDs = asyncHandler(async (req, res) => {
  try {
    const leds = await LEDModel.find();
    res.status(200).send(leds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const createLED = asyncHandler(async (req, res) => {
  try {
    const { name, location, screenSize } = req.body;
    if (!name || !location || !screenSize) {
      return res
        .status(400)
        .send("Name , location and screenSize are required");
    }

    const existingLED = await LEDModel.findOne({ name });
    if (existingLED) {
      return res
        .status(400)
        .send({ message: "LED with this name already exists" });
    }

    const led = new LEDModel({ name, location, screenSize });
    await led.save();
    res.status(201).send(led);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const updateLED = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const fieldToUpdate = {};

    if (req.body.name) fieldToUpdate.name = req.body.name;
    if (req.body.location) fieldToUpdate.location = req.body.location;
    if (req.body.screenSize) fieldToUpdate.screenSize = req.body.screenSize;

    const led = await LEDModel.findByIdAndUpdate(id, fieldToUpdate, {
      new: true,
    });
    if (!led) {
      return res.status(404).send("LED not found");
    }
    res.status(200).send({ message: "Successfully updated !", data: led });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const deleteLED = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const led = await LEDModel.findByIdAndDelete(id);
  if (!led) {
    return res.status(404).send("LED not found");
  }
  res.status(200).send({ message: "Successfully deleted !", data: led });
});

module.exports = {
  getLEDs,
  createLED,
  updateLED,
  deleteLED,
};
