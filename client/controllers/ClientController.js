// Contrôleur clients
const {
  findClientByEmail,
  hashPassword,
  createClient,
  comparePassword,
  findClientById,
} = require("../models/ClientModel");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// Inscription
const register = async (req, res) => {
  // 1. Vérifier le résultat de la validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Erreur de validation des données.",
      errors: errors.array(),
    });
  }

  try {
    // Les données ont été nettoyées par express-validator (trim, escape, normalizeEmail)
    const { nom, prenom, email, mots_de_passe } = req.body;

    // 2. vérifier si l'email existe deja
    const existingClient = await findClientByEmail(email);

    if (existingClient.length > 0) {
      return res.status(409).json({ // 409 Conflict est plus approprié ici
        message: "Un compte avec cette adresse email existe déjà.",
      });
    }

    // 3. Hacher le mot de passe
    const hash = await hashPassword(mots_de_passe);

    // 4. Crée le client
    const result = await createClient({
      nom,
      prenom,
      email,
      mots_de_passe: hash,
    });

    res.status(201).json({
      message: "Client créé avec succès.",
      code_client: result.insertId,
      client: { nom, prenom, email },
    });
  } catch (error) {
    console.error("Erreur inscription", error.message);
    res.status(500).json({
      message: "Erreur serveur lors de la création du client.",
    });
  }
};

//Connexion
const login = async (req, res) => {
  try {
    const { email, mots_de_passe } = req.body;

    // Recherche le client
    const clients = await findClientByEmail(email);

    if (clients.length === 0) {
      return res.status(401).json({
        message: "Identifiants incorrects.",
      });
    }

    const client = clients[0];

    //Verifier le mot de passe
    const isMatch = await comparePassword(mots_de_passe, client.mots_de_passe);

    if (!isMatch) {
      return res.status(401).json({
        message: "Identifiants incorrects.",
      });
    }

    //Générer le token JWT
    const expire = parseInt(process.env.JWT_EXPRESS_IN, 10) || 3600;
    const token = jwt.sign(
      {
        id: client.code_client,
        email: client.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: expire },
    );

    //On place le token dens un cookie HttpOnly
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: ".mbaradji.dev-campus.fr",
      maxAge: expire * 1000,
    });

    res.json({
      message: "Connexion reussi",
      token,
      client: {
        id: client.code_client,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
      },
    });
  } catch (error) {
    console.error("erreur de connexion utilisateur", error.message);
    res.status(500).json({
      message: "Erreur lors de la connexion",
    });
  }
};

//Fonction de déconnexion
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: ".mbaradji.dev-campus.fr",
  });
  res.json({ message: "Déconnexion réussie" });
};

//Automatiquement le nav envoie le cookie
//le middleware vérifie le JWT
//Si le token est valide, on retourne les infos du client
const getMe = async (req, res) => {
  try {
    // Utilise req.user.id injecté par le middleware
    const clients = await findClientById(req.user.id);

    if (clients.length === 0) {
      return res.status(404).json({ message: "Client introuvable" });
    }

    const client = clients[0];

    // Renvoie TOUTES les infos nécessaires pour l'Espace Client
    res.json({
      client: {
        id: client.code_client,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone,
        points_fidelite: client.points_fidelite || 0,
        date_inscription: client.date_inscription,
      },
    });
  } catch (error) {
    console.error("[GET /client/me]", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
module.exports = { register, login, getMe, logout };
