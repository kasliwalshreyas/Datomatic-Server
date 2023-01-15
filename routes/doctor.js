const express = require("express");
const { body } = require("express-validator");

const doctorController = require("../controllers/doctor");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

// POST /doctor/save-prescription
router.post(
  "/save-prescription",
  isAuth,
  [
    body("patientName").trim().not().isEmpty(),
    body("patientPhoneNumber").trim().not().isEmpty(),
    body("patientAge").trim().not().isEmpty(),
    body("patientGender").trim().not().isEmpty(),
    body("doctorId").trim().not().isEmpty(),
  ],
  doctorController.savePrescription
);

// GET /doctor/prescriptions
router.get("/prescriptions", isAuth, doctorController.getPrescriptions);

// GET /doctor/last-month-prescriptions
router.get(
  "/last-month-prescriptions",
  isAuth,
  doctorController.getLastMonthPrescriptions
);

// GET /doctor/patient-count
router.get("/patient-count", isAuth, doctorController.getPatientCount);

// GET /doctor/patient-prescriptions/:phoneNumber
router.get(
  "/patient-prescriptions/:phoneNumber",
  isAuth,
  doctorController.getPatientPrescriptions
);

// GET /doctor/info

router.get("/info", isAuth, doctorController.getDoctorInfo);

// POST /doctor/info

router.post("/info", isAuth, doctorController.postDoctorInfo);

// GET /doctor/patient/:phoneNumber

router.get("/patient/:phoneNumber", isAuth, doctorController.getPatient);

// PUT /doctor/upload-report

router.put("/upload-report", isAuth, doctorController.uploadReport);

// GET /doctor/get-reports/:phoneNumber

router.get("/get-reports/:phoneNumber", isAuth, doctorController.getReports);

module.exports = router;
