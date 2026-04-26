const express = require("express");
const multer = require("multer");
const verifyController = require("../controllers/verifyController");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), verifyController.verifyImage);

module.exports = router;
