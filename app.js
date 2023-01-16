const path = require("path");

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const { getClosesMatch } = require("./utils/levdist");
const multer = require("multer");
const bodyParser = require("body-parser");

const app = express();

// ROUTE IMPORTS
const authRoutes = require("./routes/auth");
const scanRoutes = require("./routes/scan");
const dataRoutes = require("./routes/data");
const doctorRoutes = require("./routes/doctor");
const patientRoutes = require("./routes/patient");
const pharmacyRoutes = require("./routes/pharmacy");
const { ACTIONS } = require("./utils/Actions");

const { fileStorage, getFileStream } = require("./utils/s3");

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

// SETTING HEADERS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");

  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  next();
});

// PDF File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// FOR UPLOADING THE PDF
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("file")
);

// FOR DOWNLOADING THE PDF
app.get("/file/:key", (req, res, next) => {
  const key = req.params.key;
  const readStream = getFileStream(key);

  readStream.pipe(res);
});

// ADD ROUTES
app.get("/", (req, res) => {
  return res.send("Server working!");
});
app.use("/auth", authRoutes);
app.use("/data", dataRoutes);
app.use("/doctor", doctorRoutes);
app.use("/patient", patientRoutes);
app.use("/pharmacy", pharmacyRoutes);
app.use(scanRoutes);

// ERROR HANDLING
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message: message,
    data: data,
  });
});

mongoose
  .connect(process.env.MONGO_DB_CONNECTION_URI)
  .then((result) => {
    console.log("Connected");
    console.log("Listening on port ", process.env.PORT);
    const server = app.listen(process.env.PORT);

    const io = require("./socket").init(server, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      socket.on(ACTIONS.JOIN, ({ userId }) => {
        socket.join(userId);
      });

      socket.on("disconnecting", () => {
        socket.leave();
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
