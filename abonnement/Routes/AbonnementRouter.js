const express = require("express");
const router = express.Router();
const AbonnementController = require("../controllers/AbonnementController");

// Route pour obtenir tous les abonnements : GET /api/abonnements
router.get("/", AbonnementController.getPlans);

// Route pour ton futur Admin (Mise à jour Stripe ID)
// On la met en PUT car c'est une modification
router.put("/update-stripe/:id", AbonnementController.updateStripePrice);

module.exports = router;
