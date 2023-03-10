const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
  doctorInfo: {
    hospitalName: {
      type: String,
    },
    extraInfo: {},
  },
  pharmacyInfo: {
    pharmacyName: {
      type: String,
    },
    extraInfo: {},
  },
  patientInfo: {},
});

module.exports = mongoose.model("User", userSchema);
