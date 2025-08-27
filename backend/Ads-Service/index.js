require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const LEDRouter = require("./Router/LEDsRoutes");
const AdsRouter = require("./Router/AdsRoutes");

app.get("/", (req, res) => {
  res.send("Hello from the Ads Service!");
});

app.use("/api/led", LEDRouter);
app.use("/api/ads", AdsRouter);

mongoose.connect(uri).then(() => {
  console.log("MongoDB connected successfully");
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
