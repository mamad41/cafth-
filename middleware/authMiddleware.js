const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Pas de token → 401 (non authentifié)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Correction: utilise req.user comme demandé
    next();

  } catch (err) {
    // Token expiré → 401 (le front redirige vers login)
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expirée' });
    }
    // Token falsifié → 403 (interdit)
    return res.status(403).json({ message: 'Token invalide' });
  }
};

module.exports = { verifyToken };
