const db = require("../../db");

const createOrder = async (clientId, total, items) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insertion dans 'commande'
    const [orderResult] = await connection.execute(
      "INSERT INTO commande (date_commande, montant_total_ttc, statut_commande, code_client) VALUES (NOW(), ?, 'en_attente', ?)",
      [total, clientId],
    );

    // numero_de_commande est récupéré via l'auto-increment
    const orderId = orderResult.insertId;

    // 2. Insertion dans 'commande_details'
    for (const item of items) {
      await connection.execute(
        "INSERT INTO commande_details (numero_de_commande, reference_sku, quantite, prix_unitaire) VALUES (?, ?, ?, ?)",
        [
          orderId,
          item.reference_sku,
          item.quantite,
          item.prix_final || item.prix_ttc,
        ],
      );
    }

    // 3. Mise à jour des points de fidélité (1€ = 1 grain)
    const pointsGagnes = Math.floor(total); // On arrondit à l'entier inférieur
    if (pointsGagnes > 0) {
      await connection.execute(
        "UPDATE client SET points_fidelite = COALESCE(points_fidelite, 0) + ? WHERE code_client = ?",
        [pointsGagnes, clientId]
      );
    }

    await connection.commit();
    return orderId;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("ERREUR SQL DÉTAILLÉE DANS CREATEORDER:", error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Récupère l'historique complet des commandes d'un client avec les détails des articles.
 * @param {number} clientId - L'ID du client.
 * @returns {Promise<Array>} - Un tableau de commandes formatées.
 */
const getOrderHistoryByClientId = async (clientId) => {
  // Cette requête joint les commandes, les détails et les produits pour récupérer toutes les informations en une seule fois.
  const query = `
    SELECT
      c.numero_de_commande AS id_commande,
      c.date_commande,
      c.montant_total_ttc AS total_commande,
      c.statut_commande AS statut,
      cd.quantite,
      cd.prix_unitaire,
      p.* -- Sélectionne toutes les colonnes de la table produit
    FROM commande c
    JOIN commande_details cd ON c.numero_de_commande = cd.numero_de_commande
    JOIN produit p ON cd.reference_sku = p.reference_sku
    WHERE c.code_client = ?
    ORDER BY c.date_commande DESC, c.numero_de_commande DESC;
  `;

  const [rows] = await db.query(query, [clientId]);

  if (rows.length === 0) {
    return [];
  }

  // Le résultat de la BDD est "plat". On doit le transformer en structure imbriquée.
  const commandes = {}; // Utilise un objet pour regrouper facilement les items par commande

  rows.forEach(row => {
    const { id_commande, date_commande, total_commande, statut, quantite, prix_unitaire, ...produitDetails } = row;

    // Si on n'a pas encore vu cette commande, on l'initialise
    if (!commandes[id_commande]) {
      commandes[id_commande] = {
        id_commande,
        date_commande,
        total_commande,
        statut,
        items: [],
      };
    }

    // On ajoute l'item à la commande correspondante
    commandes[id_commande].items.push({
      ...produitDetails, // Toutes les infos du produit (reference_sku, nom_produit, image, etc.)
      quantite,
      prix_unitaire,
    });
  });

  // On convertit l'objet de commandes en tableau, comme attendu dans la réponse finale.
  return Object.values(commandes);
};


module.exports = { createOrder, getOrderHistoryByClientId };
