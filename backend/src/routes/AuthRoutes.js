const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/AuthController");

router.get("/", AuthController.TestResponse);

module.exports = router;