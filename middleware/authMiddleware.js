const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // 1. Récupération du token (Cookie ou Header Authorization)
  let token = req.cookies && req.cookies.token;

  if (!token) {
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      const parts = authHeader.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }
  }

  // 2. Si aucun token n'est trouvé après les deux vérifications
  if (!token) {
    return res.status(403).json({ message: "Token manquant" });
  }

  // 3. Vérification du token avec JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expiré" });
      }
      return res.status(401).json({ message: "Token invalide" });
    }

    // 4. Succès : on injecte les données décodées dans req.client pour les routes suivantes
    req.client = decoded;
    next();
  });
};

module.exports = { verifyToken };
