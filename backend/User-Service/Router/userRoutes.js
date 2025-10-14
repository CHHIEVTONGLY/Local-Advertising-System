const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const upload = require("../Middleware/upload.js");

const {
  registerUserValidator,
  loginValidator,
} = require("../Validation/userValidation.js");

const {
  verifyAdmin,
  verifyPublisher,
  verifyToken,
  tryVerifyToken,
} = require("../Middleware/verifyToken.js");

// User controller
const {
  registerUser,
  login,
  getUserProfile,
  uploadProfile,
  sendVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUserProfile,
  userVerifyToken,
} = require("../Controller/userController.js");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

router.get("/me", verifyToken, getUserProfile);
router.get("/auth/verify", verifyToken, userVerifyToken);

// Register User
router.post("/register", registerUserValidator, validate, registerUser);
router.post("/login", loginValidator, login);

router.post("/upload", verifyToken, upload.single("file"), uploadProfile);

router.post("/verify-email", verifyToken, sendVerificationEmail);
router.post("/verify/:token", verifyEmail);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// UPDATE METHOD
router.put("/change-password", verifyToken, changePassword);
router.put("/update-profile", verifyToken, updateUserProfile);

module.exports = router;
