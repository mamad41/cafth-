// Controlleur Articles - Version avec Gestion des Promotions
const {
  getAllArticles,
  getArticleById,
  getModelCategory,
} = require("../models/ArticleModel");

// Récupérer tous les Articles (inclut désormais les prix promo et barrés)
const getAll = async (req, res) => {
  try {
    const articles = await getAllArticles();

    res.json({
      message: "Articles récupérés avec succès",
      count: articles.length,
      articles, // Chaque article contient : prix_ttc (original) et prix_final (réduit)
    });
  } catch (error) {
    console.error("Erreur de récupération des articles :", error.message);
    res.status(500).json({
      message: "Erreur de récupération des articles",
    });
  }
};

// Récupérer un article par son id (inclut aussi la promo si elle existe)
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const articleId = parseInt(id);

    const articles = await getArticleById(articleId);

    if (!articles || articles.length === 0) {
      return res.status(404).json({
        message: "Article non trouvé !",
      });
    }

    res.json({
      message: "Article trouvé !",
      article: articles[0], // L'article possède prix_ttc et prix_final
    });
  } catch (error) {
    console.error("Erreur de récupération de l'article :", error.message);
    res.status(500).json({
      message: "Erreur de récupération de l'article",
    });
  }
};

// Récupérer par catégorie (filtre les articles avec calcul promo inclus)
const getByCategory = async (req, res) => {
  try {
    const { categorie } = req.params;
    const articles = await getModelCategory(categorie);

    res.json({
      message: `Articles de la catégorie ${categorie}`,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error("Erreur de récupération par catégorie :", error.message);
    res.status(500).json({
      message: "Erreur de récupération des articles par catégorie",
    });
  }
};

module.exports = { getAll, getById, getByCategory };
