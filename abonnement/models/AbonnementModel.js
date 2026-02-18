const db = require("../../db"); // Importe ta connexion à la base de données

const AbonnementModel = {
  /**
   * Récupère tous les abonnements de la base cafthe
   * Triés par prix pour un affichage cohérent en Front-end
   */
  getAll: async () => {
    try {
      // On ajoute ORDER BY prix pour que les badges ne changent pas de place
      const [rows] = await db.query(
        "SELECT * FROM abonnement ORDER BY prix ASC",
      );
      return rows;
    } catch (error) {
      console.error("Erreur SQL dans AbonnementModel.getAll :", error);
      throw error;
    }
  },

  /**
   * Met à jour le Price ID de Stripe pour un abonnement spécifique
   * Sera utilisé une fois ton compte Stripe créé
   */
  updateStripePrice: async (id, stripePriceId) => {
    try {
      const [result] = await db.query(
        "UPDATE abonnement SET stripe_price_id = ? WHERE id = ?",
        [stripePriceId, id],
      );
      return result;
    } catch (error) {
      console.error(
        "Erreur SQL dans AbonnementModel.updateStripePrice :",
        error,
      );
      throw error;
    }
  },
};

module.exports = AbonnementModel;
