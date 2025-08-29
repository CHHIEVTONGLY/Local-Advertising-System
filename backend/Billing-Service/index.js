require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

const { requireAuth } = require("./Middleware/verifyToken");

const walletRoutes = require("./Router/walletRoutes");
const transactionRoutes = require("./Router/transactionRoutes");
const adsTransactionRoutes = require("./Router/adsTransactionRoutes");

const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.use("/api/wallets", requireAuth, walletRoutes);
app.use("/api/transactions", requireAuth, transactionRoutes);
app.use("/api/ads-transactions", requireAuth, adsTransactionRoutes);

mongoose.connect(uri).then(() => {
  console.log("MongoDB connected successfully");
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
