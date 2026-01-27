const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
// Permet de charger les variable d'.env depuis .env
require("dotenv").config();

//Connexion bdd
const db = require("./db");

//Importation des routes
const articleRoutes = require("./article/routes/ArticleRouter");

//Creation de l'application Express
const app = express();

//MIDDLEWAIRES
//Parser les Json
app.use(express.json());

//Loger e requêtes HTTP dans la console
app.use(morgan("dev"));

//permet les requêtes cross-origin (qui viennent du front)
//cors : Cross origin ressource sharing
//Obligatoire sinon le navigateur bloque les requêtes

app.use(
  cors({
    origin: process.env.FRONTEND_URl || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

//Routes

//rRoute de test pour verifier que l'api fonctionne
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "api fonctionelle",
  });
});

//Route de l' api
app.use("/api/articles", articleRoutes);

//GESTION DES ERREURS

//Route 404
app.use((req, res) => {
  res.status(404).json({
    message: "Route non trouvée",
  });
});

//Demarage du serveur
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.listen(port, host, () => {
  console.log(`Serveur démarré sur http://${host}:${port}`);
});
