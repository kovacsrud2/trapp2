const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // A req.user-t az authMiddleware állítja be a tokenből
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Nincs jogosultságod a művelet végrehajtásához!' 
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };