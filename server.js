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

// ── En haut de server.js, avant toute autre route ──
app.use(cors({
  origin: [
    'https://reactjs-cafthe.mbaradji.dev-campus.fr',
    'http://localhost:3000'     // dev local
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Répond au preflight OPTIONS avant d'atteindre les routes
app.options('*', cors());


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
