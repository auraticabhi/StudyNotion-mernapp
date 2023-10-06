const express = require("express")
const router = express.Router()

const { contactUs } = require('../controllers/ContactUs');
const { auth, isStudent } = require("../middlewares/auth")

router.post("/contactUs", contactUs);

module.exports = router;