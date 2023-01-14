const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sharedPrescriptionSchema = new Schema(
  {
    patientName: {
      type: String,
      required: true,
    },
    patientPhoneNumber: {
      type: String,
      required: true,
    },
    prescriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedPharmacyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accessTimeStamp: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SharedPrescription", sharedPrescriptionSchema);
