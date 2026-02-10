const db = require("../../db"); // Ton fichier de connexion à la base

const getHistory = async (req, res) => {
  try {
    // 1. On récupère l'ID du client depuis le middleware verifyToken
    const clientId = req.client.id;

    // 2. Requête SQL pour récupérer les commandes du client
    // On utilise les noms de colonnes vus dans ta structure phpMyAdmin
    const [orders] = await db.execute(
      "SELECT * FROM commande WHERE code_client = ? ORDER BY date_commande DESC",
      [clientId],
    );

    // 3. Renvoi des données au Frontend
    res.json(orders);
  } catch (error) {
    console.error("Erreur historique commandes:", error.message);
    res.status(500).json({
      message: "Impossible de récupérer l'historique des commandes",
    });
  }
};

module.exports = { getHistory };
