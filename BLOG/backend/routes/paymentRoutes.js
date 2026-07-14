

const express = require("express");


const MiddlewareCaptcha = require("../middlewares/captchaValidation");

const { createPix, webhook } = require("../controllers/payment.js");

const router = express.Router();

router.post("/pix", MiddlewareCaptcha.VerificarCaptcha, createPix);
router.post("/webhook", webhook);


module.exports = router;