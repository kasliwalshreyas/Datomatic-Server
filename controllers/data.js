const { validationResult } = require("express-validator");

const User = require("../models/user");
const Prescription = require("../models/prescription");
const SharedPrescription = require("../models/sharedPrescription");

exports.getName = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: "User found", name: user.name });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.getPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.prescriptionId);

    if (!prescription) {
      const error = new Error("Prescription not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Prescription found",
      prescription: prescription,
    });
  } catch (err) {}
};
