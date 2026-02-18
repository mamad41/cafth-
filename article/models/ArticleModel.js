const db = require("../../db");

const baseQuery = `
  SELECT
    p.*,
    MAX(pr.pourcentage) AS promo_pourcentage, -- On prend la plus grosse promo si plusieurs
    CASE
      WHEN MAX(pr.id) IS NOT NULL AND MAX(pr.est_active) = 1 AND NOW() BETWEEN MAX(pr.date_debut) AND MAX(pr.date_fin)
        THEN ROUND(p.prix_ttc * (1 - MAX(pr.pourcentage) / 100), 2)
      ELSE p.prix_ttc
      END AS prix_final
  FROM produit p
         LEFT JOIN promotion_produit pp ON p.reference_sku = pp.reference_sku
         LEFT JOIN promotions pr ON pp.id_promotion = pr.id
  GROUP BY p.reference_sku -- Très important pour garder une ligne par variante
`;

const getAllArticles = async () => {
  const [rows] = await db.query(baseQuery);
  return rows;
};

const getArticleById = async (id) => {
  const [rows] = await db.query(`${baseQuery} HAVING p.reference_sku = ?`, [
    id,
  ]);
  return rows;
};

const getModelCategory = async (categorie) => {
  const [rows] = await db.query(`${baseQuery} HAVING p.categorie = ?`, [
    categorie,
  ]);
  return rows;
};

module.exports = { getAllArticles, getArticleById, getModelCategory };
