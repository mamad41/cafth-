// Client router
// chemin : /api/client

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

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

// Règles de validation et de sanitisation pour l'inscription
const registrationRules = [
  // Sanitize and validate 'nom'
  body("nom")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Le nom est requis.")
    .isLength({ min: 2 })
    .withMessage("Le nom doit contenir au moins 2 caractères."),

  // Sanitize and validate 'prenom'
  body("prenom")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Le prénom est requis.")
    .isLength({ min: 2 })
    .withMessage("Le prénom doit contenir au moins 2 caractères."),

  // Sanitize and validate 'email'
  body("email")
    .isEmail()
    .withMessage("L'adresse email n'est pas valide.")
    .normalizeEmail(),

  // Validate 'mots_de_passe'
  body("mots_de_passe")
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit contenir au moins 8 caractères."),
];

//inscription d'un client
// POST /api/client/register
// Body : { nom, prenom, email, mots_de_passe}
router.post("/register", registrationRules, register);

//Connexion
//POST /api/client/login
//Body : {email, mot_de_passe }
//Retourne un token JWT
router.post("/login", login);

module.exports = router;
