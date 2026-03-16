const express = require("express");
const router = express.Router();
const { getHistoryByClientId } = require("../controllers/OrderController");
const { verifyToken } = require("../../middleware/authMiddleware");

// Route pour récupérer l'historique des commandes d'un client spécifique
// GET /api/orders/client/:idClient
router.get("/client/:idClient", verifyToken, getHistoryByClientId);

module.exports = router;
