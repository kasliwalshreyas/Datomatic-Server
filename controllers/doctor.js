const { validationResult } = require("express-validator");

const User = require("../models/user");
const Prescription = require("../models/prescription");
const SharedPrescription = require("../models/sharedPrescription");

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

exports.getPrescriptions = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const patientPhoneNumbers = await Prescription.find({
      doctorId: user._id.toString(),
    }).distinct("phoneNumber");

    const resPrescription = await Promise.all(patientPhoneNumbers.map(
      async (patientPhoneNumber) => {
        const recentPrescription = await Prescription.find({
          phoneNumber: patientPhoneNumber,
          doctorId: user._id.toString(),
        })
          .sort({ createdAt: -1 })
          .limit(1);

        const prescriptionDate = new Date(recentPrescription.createdAt);

        console.log(recentPrescription);

        return {
          _id: recentPrescription._id,
          patientName: recentPrescription.name,
          patientPhoneNumber: recentPrescription.phoneNumber,
          date:
            prescriptionDate.getDate() +
            "/" +
            (prescriptionDate.getMonth() + 1) +
            "/" +
            prescriptionDate.getFullYear(),
          time:
            prescriptionDate.getHours() +
            ":" +
            prescriptionDate.getMinutes() +
            " " +
            (prescriptionDate.getHours() > 12 ? "PM" : "AM"),
          priority: "low",
        };
      }
    ));

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

exports.getLastMonthPrescriptions = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const prescriptionNumber = await Prescription.count({
      doctorId: user._id.toString(),
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    });

    res.status(200).json({
      message: "Prescriptions found",
      prescriptionsInLastMonth: prescriptionNumber,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPatientCount = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const distinctPatient = await Prescription.count({
      doctorId: user._id.toString(),
    }).distinct("phoneNumber");

    res.status(200).json({
      message: "Patient count found",
      patientCount: distinctPatient.length,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPatientPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({
      phoneNumber: req.params.phoneNumber,
    });

    const resPrescription = prescriptions.map((prescription) => {
      const prescriptionDate = new Date(prescription.createdAt);

      return {
        _id: prescription._id,
        patientName: prescription.name,
        date:
          prescriptionDate.getDate() +
          "/" +
          (prescriptionDate.getMonth() + 1) +
          "/" +
          prescriptionDate.getFullYear(),
        time:
          prescriptionDate.getHours() +
          ":" +
          prescriptionDate.getMinutes() +
          " " +
          (prescriptionDate.getHours() > 12 ? "PM" : "AM"),
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
