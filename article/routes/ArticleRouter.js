// Routeur Articles
// Chemin : /api/articles

const express = require("express");
const {
  getAll,
  getById,
  getByCategory,
} = require("../controllers/ArticleController");
const { verifyToken } = require("../../middleware/authMiddleware");

const router = express.Router();

//GET /api/articles - Récupérer tous les articles

router.get("/", getAll);

//GET /api/articles/:id
router.get("/:id", getById);

//GET /api/articles/categorie/:categorie
router.get("/categorie/:categorie", getByCategory);

module.exports = router;
