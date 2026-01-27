//Controlleur Articles
const { getAllArticles, getArticleById } = require("../models/ArticleModel");

//Récupérer tous les Articles
const getAll = async (req, res) => {
  try {
    const articles = await getAllArticles();

    res.json({
      message: "Articles récupérer avec succès",
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error("erreur de récupération des articles", error.message);
    res.status(500).json({
      message: "Erreur de récupération des articles",
    });
  }
};

//Recuperer un article par son id
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const articleId = parseInt(id);

    const articles = await getArticleById(articleId);

    if (articles.length === 0) {
      return res.status(404).json({
        message: "article non trouver !",
      });
    }
    res.json({
      message: "article trouver !",
      article: articles[0],
    });
  } catch (error) {
    console.error("erreur de récupération des articles", error.message);
    res.status(500).json({
      message: "Erreur de récupération des articles",
    });
  }
};
module.exports = { getAll, getById };
