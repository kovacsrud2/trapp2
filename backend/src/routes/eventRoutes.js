const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// GET /api/events - Bármilyen bejelentkezett felhasználó láthatja
//router.get('/', verifyToken, eventController.getAllEvents);

//GET /api/events - Bárki láthatja az eseményeket, bejelentkezés nélkül.
router.get('/', eventController.getAllEvents);

// Végpont a saját események lekérésére
// GET /api/events/my
router.get('/my', verifyToken, authorizeRoles('student','teacher','admin'),eventController.getMyRegisteredEvents);

// GET /api/events/:id/participants - ÚJ: Résztvevők lekérdezése (tanár/admin)
router.get('/:id/participants', verifyToken, authorizeRoles('teacher', 'admin'), eventController.getEventParticipants);

// POST /api/events - Csak tanár vagy admin hozhat létre eseményt
router.post('/', verifyToken, authorizeRoles('teacher', 'admin'), eventController.createEvent);

// POST /api/events/:id/register -  Csak tanuló jelentkezhet eseményre
router.post('/:id/register', verifyToken, authorizeRoles('student'), eventController.registerForEvent);

// DELETE /api/events/:id/register - ÚJ: Diák leiratkozása
router.delete('/:id/register', verifyToken, authorizeRoles('student'), eventController.unregisterFromEvent);

//08.13

// PUT /api/events/:id - Esemény módosítása
router.put('/:id', verifyToken, authorizeRoles('teacher', 'admin'), eventController.updateEvent);

// DELETE /api/events/:id - Esemény törlése
router.delete('/:id', verifyToken, authorizeRoles('teacher', 'admin'), eventController.deleteEvent);

module.exports = router;