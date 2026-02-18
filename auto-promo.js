const db = require("./db");

async function executerAutomatePromo() {
  const connection = await db.getConnection(); // On récupère une connexion pour la transaction
  try {
    await connection.beginTransaction();

    // 1. Récupérer les produits qui dorment (Stock > 50 et 0 ventes)
    const [produits] = await connection.query(
      "SELECT reference_sku, nom_produit FROM vue_analyse_ventes WHERE stock > 50 AND total_ventes = 0",
    );

    if (produits.length === 0) {
      console.log(
        "Aucun produit ne remplit les critères de promotion aujourd'hui. ☕",
      );
      await connection.rollback();
      return;
    }

    // 2. Préparer les dates (J+7)
    const dateDebut = new Date();
    const dateFin = new Date();
    dateFin.setDate(dateFin.getDate() + 7);

    // 3. Créer la promotion dans la table 'promotions'
    const nomPromo = `Déstockage Flash - ${new Date().toLocaleDateString()}`;
    const [resultatPromo] = await connection.query(
      `INSERT INTO promotions (nom, description, pourcentage, date_debut, date_fin, est_active) 
             VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nomPromo,
        "Promotion automatique sur les produits à fort stock",
        15,
        dateDebut,
        dateFin,
        1,
      ],
    );

    const idPromo = resultatPromo.insertId; // On récupère l'ID de la promo qu'on vient de créer

    // 4. Lier chaque produit trouvé à cette promotion dans 'promotion_produit'
    const valeursLiaison = produits.map((p) => [idPromo, p.reference_sku]);

    await connection.query(
      "INSERT INTO promotion_produit (id_promotion, reference_sku) VALUES ?",
      [valeursLiaison],
    );

    await connection.commit();
    console.log(
      `✅ Succès ! Promotion '${nomPromo}' créée pour ${produits.length} produits.`,
    );
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Erreur lors de l'automatisation :", error);
  } finally {
    if (connection) connection.release();
  }
}

executerAutomatePromo();
