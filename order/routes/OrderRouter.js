const express = require("express");
const router = express.Router();
const { getHistory } = require("../Controllers/OrderController");
const { verifyToken } = require("../../middleware/authMiddleware");

// Route pour l'historique : GET /api/orders/history
router.get("/history", verifyToken, getHistory);

module.exports = router;
