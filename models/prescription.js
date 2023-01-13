const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const prescriptionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    medications: [
      {
        RxNORMcode: {
          type: String,
        },
        medicationName: {
          type: String,
        },
        dosage: {
          type: String,
        },
        route: {
          type: String,
        },
        frequency: {
          type: String,
        },
      },
    ],
    remarks: {
      type: String,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
