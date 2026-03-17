require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const db = require("./db");

const articleRoutes = require("./article/routes/ArticleRouter");
const clientRoutes = require("./client/routes/ClientRouter");
const paymentRoutes = require("./Payment/Routes/PaymentRouter");
const orderRoutes = require("./order/routes/OrderRouter");
const abonnementRoutes = require("./abonnement/Routes/AbonnementRouter");

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));

// Configuration CORS dynamique et très tolérante
app.use(
  cors({
    origin: function (origin, callback) {
      // Autoriser les requêtes sans origine (comme Postman ou curl)
      if (!origin) return callback(null, true);

      // On accepte l'origine si elle vient de votre domaine dev-campus.fr
      if (
        origin.includes("mbaradji.dev-campus.fr") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }

      // Sinon on bloque
      return callback(new Error("CORS policy violation"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  }),
);

app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "api fonctionnel",
  });
});

app.use("/api/articles", articleRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/commandes", orderRoutes);
app.use("/api/abonnements", abonnementRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route non trouvée",
  });
});

const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.listen(port, host, () => {
  console.log(`Serveur démarrer sur http://${host}:${port}`);
});
