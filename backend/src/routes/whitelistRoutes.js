const express = require('express');
const router = express.Router();
const whitelistController = require('../controllers/whitelistController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// GET /api/whitelist - Összes engedélyezett azonosító lekérdezése
router.get('/', verifyToken, authorizeRoles('admin'), whitelistController.getAllValidIds);

// POST /api/whitelist - Új azonosító hozzáadása
router.post('/', verifyToken, authorizeRoles('admin'), whitelistController.addValidId);

// DELETE /api/whitelist/:id - Azonosító törlése
router.delete('/:id', verifyToken, authorizeRoles('admin'), whitelistController.removeValidId);

module.exports = router;