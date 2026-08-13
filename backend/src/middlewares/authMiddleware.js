const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // A token általában az Authorization header-ben érkezik: "Bearer "
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Nincs token megadva, a hozzáférés megtagadva!' });
  }

  try {
    // Token dekódolása és ellenőrzése
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // A kódolt adatokat (id, role, stb.) rárakjuk a request objektumra
    req.user = decoded; 
    
    next(); // Továbbengedjük a kérést a megfelelő végpontra
  } catch (error) {
    return res.status(403).json({ message: 'Érvénytelen vagy lejárt token!' });
  }
};

module.exports = { verifyToken };