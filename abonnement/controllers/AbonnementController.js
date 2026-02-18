const AbonnementModel = require("../models/AbonnementModel");

const AbonnementController = {
  // Récupération de tous les abonnements pour l'affichage Front-end
  getPlans: async (req, res) => {
    try {
      // On récupère les abonnements (incluant stripe_price_id via le SELECT *)
      const plans = await AbonnementModel.getAll();

      if (!plans || plans.length === 0) {
        return res.status(200).json([]);
      }

      res.status(200).json(plans);
    } catch (error) {
      console.error("Erreur AbonnementController (getPlans):", error);
      res.status(500).json({
        message: "Erreur lors de la récupération des abonnements",
        error: error.message,
      });
    }
  },

  // Nouvelle méthode pour mettre à jour l'identifiant Stripe d'un abonnement
  updateStripePrice: async (req, res) => {
    const { id } = req.params; // L'ID de l'abonnement dans ta BDD
    const { stripe_price_id } = req.body; // Le futur Price ID fourni par Stripe

    try {
      // Vérification basique des données
      if (!stripe_price_id) {
        return res
          .status(400)
          .json({ message: "Le stripe_price_id est requis" });
      }

      const result = await AbonnementModel.updateStripePrice(
        id,
        stripe_price_id,
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Abonnement non trouvé" });
      }

      res.status(200).json({
        message: "Identifiant Stripe mis à jour avec succès !",
        updatedId: id,
      });
    } catch (error) {
      console.error("Erreur AbonnementController (updateStripePrice):", error);
      res.status(500).json({
        message: "Erreur lors de la mise à jour de l'identifiant Stripe",
        error: error.message,
      });
    }
  },
};

module.exports = AbonnementController;
