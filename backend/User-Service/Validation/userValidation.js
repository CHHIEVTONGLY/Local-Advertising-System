const { checkSchema } = require("express-validator");
const User = require("../Model/userModel");

const registerUserValidator = checkSchema({
  name: {
    notEmpty: true,
    isLength: {
      options: {
        min: 5,
        max: 20,
      },
      errorMessage: "Name must be at least 5 characters",
    },
  },
  email: {
    notEmpty: true,
    isEmail: true,
    errorMessage: "Email invalid",
  },
  password: {
    notEmpty: true,
    isLength: {
      options: {
        min: 8,
        max: 20,
      },
      errorMessage: "Password must be at least 8 characters",
    },
  },
});

const loginValidator = checkSchema({
  email: {
    notEmpty: true,
    isEmail: true,
    custom: {
      options: async (value) => {
        const checkUser = await User.find({ email: value });
        if (checkUser.length == 0) {
          throw new Error("Email not registered");
        }
      },
    },
  },
  password: {
    notEmpty: true,
    isLength: {
      options: {
        min: 8,
        max: 20,
      },
      errorMessage: "Password must be at least 8 characters",
    },
  },
});

module.exports = { registerUserValidator, loginValidator };
