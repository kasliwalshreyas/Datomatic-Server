const express = require("express");
const { body } = require("express-validator");

const patientController = require("../controllers/patient");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

// GET /patient/prescriptions
router.get("/prescriptions", isAuth, patientController.getPrescriptions);

// POST /patient/share-prescription
router.post("/share-prescription", isAuth, patientController.sharePrescription);

// GET /patient/get-doctors
router.get("/get-doctors", isAuth, patientController.getDoctors);

// GET /patient/get-prescriptions/:doctorId
router.get("/get-prescriptions/:doctorId", isAuth, patientController.getPrescriptionsByDoctor);

// GET /patient/get-reports/:doctorId
router.get("/get-reports/:doctorId", isAuth, patientController.getReportsByDoctor);

// GET /patient/get-doctor-info/:doctorId
router.get("/get-doctor-info/:doctorId", isAuth, patientController.getDoctorInfo);


module.exports = router;