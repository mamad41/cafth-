const OrderModel = require("../models/OrderModel");

/**
 * Récupère l'historique des commandes d'un client spécifique.
 * Vérifie que l'utilisateur authentifié a le droit de consulter ces commandes.
 * @param {object} req - La requête Express avec les paramètres et l'utilisateur authentifié.
 * @param {object} res - La réponse Express.
 */
const getHistoryByClientId = async (req, res) => {
  try {
    // 1. Récupérer l'ID du client depuis les paramètres de l'URL
    const clientId = parseInt(req.params.idClient, 10);

    // 2. Vérifier l'autorisation : l'ID du client dans le JWT doit correspondre à l'ID demandé
    if (req.client.id !== clientId) {
      return res.status(403).json({
        message: "Accès interdit : vous n'êtes pas autorisé à consulter ces commandes.",
      });
    }

    // 3. Récupérer l'historique des commandes depuis le modèle
    const commandes = await OrderModel.getOrderHistoryByClientId(clientId);

    // 4. Formater la réponse dans la structure attendue
    res.status(200).json({ commandes });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des commandes :", error);
    res.status(500).json({
      message: "Erreur serveur : impossible de récupérer l'historique des commandes.",
      error: error.message,
    });
  }
};

module.exports = {
  getHistoryByClientId,
};
