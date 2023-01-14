const express = require("express");
const { body } = require("express-validator");

const pharmacyController = require("../controllers/pharmacy");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

// GET /pharmacy/prescriptions
router.get("/prescriptions", isAuth, pharmacyController.getPrescriptions);

// GET /pharmacy/pharmacy-name
router.get("/pharmacy-name", isAuth, pharmacyController.getPharmacyName);

module.exports = router;