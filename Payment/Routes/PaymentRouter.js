const express = require("express");
const router = express.Router();
const paymentController = require("../Controller/PaymentController");
const { verifyToken } = require("../../middleware/authMiddleware");

router.post(
  "/create-checkout-session",
  verifyToken,
  paymentController.createCheckoutSession,
);

module.exports = router;
