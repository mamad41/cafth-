const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
// permet de charger les variable d'.env depuis.env
require("dotenv").config();

//Connexion bdd
const db = require("./db");

//Importation des routes
const articleRoutes = require("./article/routes/ArticleRouter");
const clientRoutes = require("./client/routes/ClientRouter");
const paymentRoutes = require("./Payment/Routes/PaymentRouter");
const orderRoutes = require("./order/routes/OrderRouter");
//Creation de l'application Express
const app = express();

//MIDDLEWAIRE
//Parser les Json
app.use(express.json());

//Logger e requêtes HTTP dans la console
app.use(morgan("dev"));

//Sert les fichiers statiques (images, produits )
app.use(express.static("public"));

//Permet les requêtes cross origin (qui viennent du front)
//cors : Cross origin ressource sharing
//Obligatoire sinon le navigateur bloque les requêtes

app.use(
  cors({
    origin: process.env.FRONTEND_URl || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

//Parser les cookies dans req
app.use(cookieParser());

//Routes

//rRoute de test pour verifier que l'api fonctionne
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "api fonctionnel",
  });
});

//Route de l'api
app.use("/api/articles", articleRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);

//Gestion des erreurs

//Route 404
app.use((req, res) => {
  res.status(404).json({
    message: "Route non trouvée",
  });
});

//Démarrage du serveur
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.listen(port, host, () => {
  console.log(`Serveur démarrer sur http://${host}:${port}`);
});
