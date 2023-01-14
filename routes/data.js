const express = require("express");
const { body } = require("express-validator");

const dataController = require("../controllers/data");

const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /data/name
router.get("/name", isAuth, dataController.getName);

// GET /data/prescription
router.get("/prescription/:prescriptionId", isAuth, dataController.getPrescription);

module.exports = router;
