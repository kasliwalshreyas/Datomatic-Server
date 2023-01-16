const { validationResult } = require("express-validator");

const io = require("../socket");
const { ACTIONS } = require("../utils/Actions");

const User = require("../models/user");
const Prescription = require("../models/prescription");
const Report = require("../models/report");
const SharedPrescription = require("../models/sharedPrescription");

exports.getPrescriptions = async (req, res, next) => {
  try {
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
        hospitalName: prescription.doctorId.doctorInfo.hospitalName,
        remarks: prescription.remarks,
        createdAt:
          prescriptionDate.getDate() +
          "/" +
          (prescriptionDate.getMonth() + 1) +
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

exports.sharePrescription = async (req, res, next) => {
  try {
    const pharmacyId = req.body.pharmacyId;
    const prescriptionId = req.body.prescriptionId;
    const patientId = req.userId;

    const prescription = await Prescription.findById(prescriptionId).populate(
      "doctorId"
    );
    const patient = await User.findById(patientId);

    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    if (!prescription) {
      const error = new Error("Prescription not found");
      error.statusCode = 404;
      throw error;
    }

    if (prescription.phoneNumber !== patient.phoneNumber) {
      const error = new Error("Not authorized to share prescription");
      error.statusCode = 401;
      throw error;
    }

    var accessTimeStamp = new Date();

    accessTimeStamp.setMinutes(accessTimeStamp.getMinutes() + 30);

    const sharedPrescription = new SharedPrescription({
      patientName: prescription.name,
      prescriptionId: prescriptionId,
      patientPhoneNumber: prescription.phoneNumber,
      doctorId: prescription.doctorId,
      sharedPharmacyId: pharmacyId,
      accessTimeStamp: accessTimeStamp,
    });

    const prescriptionDate = new Date(prescription.createdAt);
    const prescriptionInfo = {
      _id: prescription._id,
      patientName: prescription.name,
      doctorName: prescription.doctorId.name,
      hospitalName: prescription.doctorId.doctorInfo.hospitalName,
      remarks: prescription.remarks,
      createdAt:
        prescriptionDate.getDate() +
        "/" +
        (prescriptionDate.getMonth() + 1) +
        "/" +
        prescriptionDate.getFullYear(),
    };

    io.getIo().to(pharmacyId).emit(ACTIONS.PRESCRIPTION_SHARED, {
      prescriptionInfo,
    });

    const result = await sharedPrescription.save();

    res.status(201).json({
      message: "Prescription shared",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getDoctors = async (req, res, next) => {
  try {
    const patientId = req.userId;

    let phoneNumber = await User.findById(patientId);

    phoneNumber = phoneNumber.phoneNumber;

    const recentDoctors = await Prescription.find({
      phoneNumber: phoneNumber,
    }).distinct("doctorId");

    const doctorsWithRecentVisitation = recentDoctors.map(async (doctorId) => {
      const recentVisit = await Prescription.find({
        phoneNumber: phoneNumber,
        doctorId: doctorId,
      })
        .sort({ createdAt: -1 })
        .limit(1);

      const doctor = await User.findById(doctorId);

      const prescriptionDate = new Date(recentVisit[0].createdAt);

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "June",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ];

      return {
        _id: doctor._id,
        name: doctor.name,
        hospitalName: doctor.doctorInfo.hospitalName,
        recentVisit: recentVisit[0].createdAt,
        recentVisitDate:
          prescriptionDate.getDate() +
          " " +
          monthNames[prescriptionDate.getMonth()] +
          " " +
          prescriptionDate.getFullYear(),
        recentVisitTime:
          prescriptionDate.getHours() + ":" + prescriptionDate.getMinutes(),
      };
    });

    const doctors = await Promise.all(doctorsWithRecentVisitation);

    const sortedDoctors = doctors.sort((a, b) => {
      return new Date(b.recentVisit) - new Date(a.recentVisit);
    });

    res.status(200).json({
      message: "Doctors found",
      doctors: sortedDoctors,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPrescriptionsByDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;
    const patientId = req.userId;
    const phoneNumber = await User.findById(patientId);

    if (!phoneNumber) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    const prescriptions = await Prescription.find({
      doctorId: doctorId,
      phoneNumber: phoneNumber.phoneNumber,
    }).populate("doctorId");

    const resPrescription = prescriptions.map((prescription) => {
      const prescriptionDate = new Date(prescription.createdAt);

      return {
        _id: prescription._id,
        name: prescription.doctorId.name,
        hospitalName: prescription.doctorId.doctorInfo.hospitalName,
        remarks: prescription.remarks,
        createdAt:
          prescriptionDate.getDate() +
          "/" +
          (prescriptionDate.getMonth() + 1) +
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

exports.getReportsByDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;
    const patientId = req.userId;
    const phoneNumber = await User.findById(patientId);

    if (!phoneNumber) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    const reports = await Report.find({
      doctorId: doctorId,
      phoneNumber: phoneNumber.phoneNumber,
    }).populate("doctorId");

    const resReports = reports.map((report) => {
      const reportDate = new Date(report.createdAt);

      return {
        _id: report._id,
        name: report.doctorId.name,
        hospitalName: report.doctorId.doctorInfo.hospitalName,
        remarks: report.remarks,
        createdAt:
          reportDate.getDate() +
          "/" +
          (reportDate.getMonth() + 1) +
          "/" +
          reportDate.getFullYear(),
      };
    });

    res.status(200).json({
      message: "reports found",
      reports: resReports,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getDoctorInfo = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;

    const doctor = await User.findById(doctorId);

    if (!doctor) {
      const error = new Error("Doctor not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Doctor found",
      doctor: doctor,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPatientInfo = async (req, res, next) => {
  try {
    const patientId = req.userId;
    const patient = await User.findById(patientId);

    if (!patient) {
      const error = new Error("Patient not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Patient info found",
      patientInfo: patient.patientInfo,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postPatientInfo = async (req, res, next) => {
  try {
    const patientId = req.userId;
    const patientInfo = req.body.patientInfo;

    await User.updateOne({ _id: patientId }, { patientInfo: patientInfo });

    res.status(200).json({
      message: "Patient info updated",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
