//Model Articles

const db = require("../../db");

//Récupérer tout les articles
const getAllArticles = async () => {
  const [rows] = await db.query("SELECT * FROM produit");
  return rows;
};

// Récupérer un article par son ID

const getArticleById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM produit WHERE réfèrence_sku = ?",
    [id],
  );
  return rows;
};
//Recuperer un articl par soa categorie

module.exports = { getAllArticles, getArticleById };
