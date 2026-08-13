const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

//08.13
// GET /api/users/profile - Profil lekérdezése
router.get('/profile', verifyToken, userController.getProfile);

//08.13
// PUT /api/users/profile -  Profil módosítása
router.put('/profile', verifyToken, userController.updateProfile);

//08.13
// PUT /api/users/password - Jelszó módosítása
router.put('/password', verifyToken, userController.updatePassword);

//08.13
// --- ADMIN VÉGPONTOK (Csak Admin szerepkörrel) ---
// GET /api/users - Összes felhasználó lekérdezése
router.get('/', verifyToken, authorizeRoles('admin'), userController.getAllUsers);

// PUT /api/users/:id/role - Szerepkör frissítése
router.put('/:id/role', verifyToken, authorizeRoles('admin'), userController.updateUserRole);

module.exports = router;