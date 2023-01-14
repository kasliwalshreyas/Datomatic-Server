const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema(
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

module.exports = mongoose.model("Report", reportSchema);
