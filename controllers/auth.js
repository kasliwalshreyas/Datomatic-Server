const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const name = req.body.name;
    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;
    const userType = req.body.userType;
    const hospitalName = req.body.hospitalName;
    const pharmacyName = req.body.pharmacyName;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name: name,
      phoneNumber: phoneNumber,
      password: hashedPassword,
      isAdmin: false,
      userType: userType,
    });

    if (userType === "doctor") {
      user.hospitalName = hospitalName;
    }

    if (userType === "pharmacy") {
      user.pharmacyName = pharmacyName;
    }

    const result = await user.save();

    res.status(201).json({ message: "User created", userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Enter non-empty phone number and password");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;

    const user = await User.findOne({ phoneNumber: phoneNumber });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      error.data = [{ param: "phoneNumber", msg: "User not found" }];
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error("Wrong password");
      error.statusCode = 401;
      error.data = [{ param: "password", msg: "Wrong password" }];
      throw error;
    }

    const token = jwt.sign(
      {
        phoneNumber: user.phoneNumber,
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5h" }
    );

    res.status(200).json({ token: token, userId: user._id.toString(), userType: user.userType });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
