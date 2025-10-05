require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const userRoutes = require("./Router/userRoutes");
const telegramBotRoutes = require("./Router/telegramBotRoutes");

const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ! User routes
app.use("/api/users", userRoutes);

// ! Telegram Bot Routes
app.use("/api/users/telegram", telegramBotRoutes);

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

mongoose.connect(uri).then(() => {
  console.log("MongoDB connected successfully");
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
