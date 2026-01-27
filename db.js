// permet de configurern le pool de connexion a MySQL
//pour faire des requêtes asyncrones async/await

const mysql = require("mysql2/promise");
require("dotenv").config();

//Pool de connexions
//Permet de gérer plusieurs connexions simultanées
//Réutiliser des connexions existantes
//Gestion automatique de la disponibilité
//Limite le nb de connexion (en même temps)

const db = mysql.createPool({
  //Paramètre de connexion

  // (host, nom d'utilisateur, mot de passe, nom de la bdd)
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // PARAMETRES DU POOL
  // si plus de connexion dispo alors elles attendent
  waitForConnections: true,
  // Limiter le nb max de connexions
  connectionLimit: 10,

  // PARAMETRES OPTIONNELS mais recommandés
  // En cas d'échec de connexion, réessayer
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Timeout de connexion (millisecondes)
  connectTimeout: 10000, // 10 secondes
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log("Connecté à la base de données MySQL");

    //se deconnecté
    connection.release();
  } catch (err) {
    console.error("Erreur de connexion à MySQL:", err.message);

    process.exit(1);
  }
})();

module.exports = db;
