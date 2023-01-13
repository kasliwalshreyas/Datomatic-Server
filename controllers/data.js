const { validationResult } = require("express-validator");

const User = require("../models/user");
const Prescription = require("../models/prescription");

exports.savePrescription = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const prescriptionData = new Prescription({
      name: req.body.patientName,
      phoneNumber: req.body.patientPhoneNumber,
      age: req.body.patientAge,
      gender: req.body.patientGender,
      medications: req.body.patientMedications,
      remarks: req.body.patientRemarks,
      doctorId: req.body.doctorId,
    });

    const result = await prescriptionData.save();

    res
      .status(201)
      .json({ message: "Prescription saved", prescriptionId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

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

exports.getPatientPrescriptions = async (req, res, next) => {
  try {
  } catch (err) {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const prescriptions = await Prescription.find({
      phoneNumber: user.phoneNumber,
    }).populate("doctorId");

    const resPrescription = prescriptions.map((prescription) => {
      const prescriptionDate = new Date(prescription.createdAt);

      return {
        _id: prescription._id,
        name: prescription.doctorId.name,
        createdAt:
          prescriptionDate.getDate() +
          "/" +
          prescriptionDate.getMonth() +
          "/" +
          prescriptionDate.getFullYear(),
      };
    });

    res.status(200).json({
      message: "Prescriptions found",
      prescriptions: resPrescription,
    });

    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getDoctorPrescriptions = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const prescriptions = await Prescription.find({
      doctorId: user._id.toString(),
    });

    const resPrescription = prescriptions.map((prescription) => {
      const prescriptionDate = new Date(prescription.createdAt);

      return {
        _id: prescription._id,
        name: prescription.name,
        createdAt:
          prescriptionDate.getDate() +
          "/" +
          prescriptionDate.getMonth() +
          "/" +
          prescriptionDate.getFullYear(),
      };
    });

    res.status(200).json({
      message: "Prescriptions found",
      prescriptions: resPrescription,
    });
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
