//Model Client

const db = require("../../db");
const bcrypt = require("bcryptjs");

//Rechercher u client par son id

const findClientById = async (id) => {
  const [rows] = await db.query("SELECT * FROM client WHERE code_client = ?", [
    id,
  ]);

  return rows;
};
//Récupérer un client par email
const findClientByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM client WHERE email = ?", [
    email,
  ]);
  return rows;
};

// Créé un nouveau client

const createClient = async (clientData) => {
  const {
    nom,
    prenom,
    telephone,
    email,
    mots_de_passe,
    adresse_de_facturation,
    ville_de_facturation,
    code_postale_facturation,
    adresse_de_livraison,
    ville_de_livraison,
    code_postale_de_livraison,
  } = clientData;

  const [result] = await db.query(
    `INSERT INTO 
     client(nom,prenom,telephone,
    email, mots_de_passe, adresse_de_facturation,
    ville_de_facturation,
    code_postale_facturation,
    adresse_de_livraison,
    ville_de_livraison, 
    code_postale_de_livraison)
  VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nom,
      prenom,
      telephone,
      email,
      mots_de_passe,
      adresse_de_facturation || null,
      ville_de_facturation || null,
      code_postale_facturation || null,
      adresse_de_livraison || null,
      ville_de_livraison || null,
      code_postale_de_livraison || null,
    ],
  );
  return result;
};

// Hacher un mot de passe
const hashPassword = async (password) => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  return await bcrypt.hash(password, rounds);
  //return await bcrypt.hash(mots_de_passe, parsInt(process.env.BCRYPT_ROUNDS) || 10);
};

// Comparer un mot de passe
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  findClientByEmail,
  createClient,
  hashPassword,
  comparePassword,
  findClientById,
};
