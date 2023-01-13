const express = require("express");
const { body } = require("express-validator");

const dataController = require("../controllers/data");

const isAuth = require('../middleware/is-auth');

const router = express.Router();

// POST /data/save-prescription
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
  dataController.savePrescription
);

// GET /data/name
router.get("/name", isAuth, dataController.getName);

// GET /data/patient-prescriptions
router.get("/patient-prescriptions", isAuth, dataController.getPatientPrescriptions);

// GET /data/doctor-prescriptions
router.get("/doctor-prescriptions", isAuth, dataController.getDoctorPrescriptions);

// GET /data/prescription
router.get("/prescription/:prescriptionId", isAuth, dataController.getPrescription);

module.exports = router;
