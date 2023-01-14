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

module.exports = router;