// Client router
// chemin : /api/client

const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
} = require("../controllers/ClientController");
const { verifyToken } = require("../../middleware/authMiddleware");

//Verification de session du client
//de Route protéger
//GET/api/client/me
router.get("/me", verifyToken, getMe);

//inscription d'un client
// POST /api/client/register
// Body : { nom, prenom, email, mots_de_passe}
router.post("/register", register);

//Connexion
//POST /api/client/login
//Body : {email, mot_de_passe }
//Retourne un token JWT
router.post("/login", login);

module.exports = router;
