const User = require("../Model/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
var jwt = require("jsonwebtoken");
const upload = require("../Middleware/upload");
const fs = require("fs").promises;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const s3 = require("../utils/s3");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, company, contact } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must contain at least 8 characters, one uppercase, one lowercase and one number",
    });
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    profileUrl:
      "https://globaladvertisingstorage.s3.ap-southeast-2.amazonaws.com/profiles/default_avatar.jpg",
    company: company || "",
    contact: contact || "",
  });

  const saveUser = await newUser.save();
  if (!saveUser) {
    return res.status(500).json({ error: "Failed to register user" });
  }
  saveUser.password = "";

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    id: saveUser._id,
    email: saveUser.email,
    role: saveUser.role,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const userFound = await User.findOne({ email });
  if (!userFound) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (!userFound || !userFound.password) {
    return res
      .status(400)
      .json({ message: "Invalid user or password not set." });
  }

  const passwordMatch = await bcrypt.compare(password, userFound.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // jwt token
  const token = jwt.sign(
    {
      id: userFound._id,
      name: userFound.name,
      email: userFound.email,
      role: userFound.role,
      profileUrl: userFound.profileUrl,
      isVerified: userFound.isVerified,
      isSSO: userFound.isSSO || false,
    },
    process.env.SECRET_KEY,
    { expiresIn: "7d" }
  );
  return res.status(200).json({ token, message: "Successfully logged in" });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

const uploadProfile = asyncHandler(async (req, res) => {
  const file = req.file;
  const user = req.user.id;
  if (!file) return res.status(400).send("No file uploaded");
  if (!user) return res.status(400).send("No user found");

  const key = `profiles/${Date.now()}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  try {
    const userFound = await User.findById(user);

    const data = await s3.upload(params).promise();

    // DELETE old profile image in S3 (if any)
    if (userFound?.profileUrl) {
      let oldKey = userFound.profileUrl;

      // If a full URL was stored previously, extract the key
      if (/^https?:\/\//i.test(oldKey)) {
        try {
          const u = new URL(oldKey);
          oldKey = decodeURIComponent(u.pathname.replace(/^\/+/, ""));
          if (oldKey.startsWith(process.env.AWS_BUCKET_NAME + "/")) {
            oldKey = oldKey.slice(process.env.AWS_BUCKET_NAME.length + 1);
          }
        } catch {}
      }

      if (oldKey) {
        s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: oldKey })
          .promise()
          .catch((err) =>
            console.warn("Failed to delete old profile image:", err.message)
          );
      }
    }

    const userUpdatedProfile = await User.findByIdAndUpdate(
      user,
      { profileUrl: data.Location },
      { new: true }
    ).select("-password");

    res.status(200).send({
      message: "Successfully uploaded profile image",
      userUpdatedProfile,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Send verify email
const sendVerificationEmail = asyncHandler(async (req, res) => {
  const userId = req.user.id; // from auth middleware
  const user = await User.findById(userId);

  if (!userId) return res.status(404).json({ message: "Not Authorization" });

  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.isVerified)
    return res.status(400).json({ message: "User already verified" });

  // Create a token with short expiration (e.g., 1 hour)
  const verificationToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );

  const base = (process.env.FRONTEND_URL || "")
    .replace(/\\+$/, "")
    .replace(/\/+$/, "");
  const urlObj = new URL("/users/verify-email", base);
  urlObj.searchParams.set("token", verificationToken);
  const verificationLink = urlObj.toString();

  // Send email (using nodemailer or any service)
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Send the email with verification link
  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Verify Your Email",
    html: `
      <h2>Verify Your Email</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationLink}">Click Here to verify</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });

  res.status(200).json({ message: "Verification email sent" });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.params.token;
  if (!token) return res.status(400).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    user.isVerified = true;
    await user.save();

    // You can redirect to a frontend page or respond with success message
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate reset token (valid for 15 minutes)
  const resetToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
    expiresIn: "5m",
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Send email (using nodemailer or any service)
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Reset Your Password",
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden;">
        <div style="background: #4CAF50; color: white; padding: 20px; text-align: center;">
          <img src="https://globaladvertisingstorage.s3.ap-southeast-2.amazonaws.com/profiles/SEProject.png" alt="Logo" style="max-width: 100px; margin-bottom: 10px;" />
          <h1 style="margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${user.name || "there"},</p>
          <p>We received a request to reset your password. Click the button below to continue:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: white; background: #4CAF50; border-radius: 5px; text-decoration: none;">Reset Password</a>
          <p style="margin-top: 20px;">If you didn’t request a password reset, you can ignore this email.</p>
        </div>
        <div style="background: #eee; text-align: center; padding: 10px;">
          <small>&copy; 2025 Global Advertising Web System </small>
        </div>
      </div>
    </div>
  `,
  });

  res.json({ message: "Password reset link sent to your email." });
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    return res.status(400).json({ message: "Token expired or invalid" });
  }
});
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Incorrect old password" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({ message: "Password changed successfully" });
});

// Update User Detail
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email, company, contact } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const updatedData = {};
    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (company) updatedData.company = company;
    if (contact) updatedData.contact = contact;

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update user profile" });
    }

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user profile", error: error.message });
  }
});

module.exports = {
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
};
