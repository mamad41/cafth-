const db = require("../../db");

const createOrder = async (clientId, total, items) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insertion dans 'commande'
    // Colonnes réelles (Capture 12:02:19) : date_de_commande, montant_total_ttc
    const [orderResult] = await connection.execute(
      "INSERT INTO commande (code_client, montant_total_ttc, date_commande, statut_commande) VALUES (?, ?, NOW(), 'en_attente')",
      [clientId, total],
    );

    // numero_de_commande est ta clé primaire AUTO_INCREMENT
    const orderId = orderResult.insertId;

    // 2. Insertion dans 'commande_details'
    // Colonnes réelles (Capture 12:15:30) : id_commande, id_produit, quantite, prix_unitaire
    for (const item of items) {
      await connection.execute(
        "INSERT INTO commande_details (numero_de_commande, id_produit, quantite, prix_unitaire) VALUES (?, ?, ?, ?)",
        [orderId, item.id, item.quantite, item.prixFinal],
      );
    }

    await connection.commit();
    return orderId;
  } catch (error) {
    await connection.rollback();
    console.error("Erreur SQL détaillée:", error.message);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { createOrder };
