const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");

// ADD CONTROLLER
const authController = require("../controllers/auth");

const router = express.Router();

// PUT /auth/signup
router.put(
  "/signup",
  [
    body("name")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Enter a non-empty name"),
    body("phoneNumber")
      .trim()
      .isMobilePhone("en-IN")
      .withMessage("Please enter a valid phone number")
      .custom(async (value, { req }) => {
        try {
          const user = await User.findOne({ phoneNumber: value });

          if (user) {
            return Promise.reject("User already exists");
          }

          return Promise.resolve();
        } catch (err) {
          if (!err.statusCode) {
            err.statusCode = 500;
          }

          next(err);
        }
      }),
    body("password")
      .trim()
      .isStrongPassword()
      .withMessage(
        "Password must contain at least 8 characters with at least 1 uppercase, 1 lowercase, 1 number and 1 symbol"
      ),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          return Promise.reject("Confirm password does not match password");
        }

        return Promise.resolve();
      }),
  ],
  authController.signup
);

// POST /auth/login
router.post(
  "/login",
  [
    body("phoneNumber")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Enter a phone number"),
    body("password").trim().not().isEmpty().withMessage("Enter a password"),
  ],
  authController.login
);

module.exports = router;
