const { validationResult } = require("express-validator");

const User = require("../models/user");
const Prescription = require("../models/prescription");
const SharedPrescription = require("../models/sharedPrescription");

exports.getPrescriptions = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const prescriptions = await SharedPrescription.find({
      sharedPharmacyId: req.userId,
    })
      .populate("prescriptionId")
      .populate("doctorId");

    const resPrescription = prescriptions.map((prescription) => {
      const prescriptionDate = new Date(prescription.prescriptionId.createdAt);

      return {
        _id: prescription.prescriptionId._id,
        patientName: prescription.prescriptionId.name,
        doctorName: prescription.doctorId.name,
        hospitalName: prescription.doctorId.doctorInfo.hospitalName,
        remarks: prescription.prescriptionId.remarks,
        createdAt:
          prescriptionDate.getDate() +
          "/" +
          (prescriptionDate.getMonth()+1) +
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

exports.getPharmacyName = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (user.userType.trim() !== "pharmacy") {
      const error = new Error("User not a pharmacy");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Pharmacy name found",
      pharmacyName: user.pharmacyInfo.pharmacyName,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
