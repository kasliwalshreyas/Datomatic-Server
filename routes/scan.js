const express = require("express");
const { body } = require("express-validator");

const scanController = require("../controllers/scan");

const router = express.Router();

router.post("/scan", scanController.getScan);

router.post("/scan-med", scanController.getMedScan);

module.exports = router;
