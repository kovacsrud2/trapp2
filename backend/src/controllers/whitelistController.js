const db = require('../config/db');

// GET /api/whitelist - Összes engedélyezett azonosító lekérdezése
exports.getAllValidIds = async (req, res) => {
  try {
    const ids = await db.query('SELECT oktatasi_azonosito FROM valid_education_ids ORDER BY oktatasi_azonosito ASC');
    res.json(ids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt az azonosítók lekérdezésekor.' });
  }
};

// POST /api/whitelist - Új oktatási azonosító engedélyezése
exports.addValidId = async (req, res) => {
  const { oktatasi_azonosito } = req.body;

  if (!oktatasi_azonosito || oktatasi_azonosito.length !== 11) {
    return res.status(400).json({ message: 'Az oktatási azonosítónak pontosan 11 karakterből kell állnia!' });
  }

  try {
    // Ellenőrizzük, hogy benne van-e már
    const existing = await db.query(
      'SELECT oktatasi_azonosito FROM valid_education_ids WHERE oktatasi_azonosito = ?', 
      [oktatasi_azonosito]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Ez az azonosító már szerepel a listán!' });
    }

    // Beszúrás
    await db.query(
      'INSERT INTO valid_education_ids (oktatasi_azonosito) VALUES (?)', 
      [oktatasi_azonosito]
    );

    res.status(201).json({ message: 'Az oktatási azonosító sikeresen hozzáadva az engedélyezettekhez!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt az azonosító hozzáadásakor.' });
  }
};

// DELETE /api/whitelist/:id - Engedélyezett azonosító törlése
exports.removeValidId = async (req, res) => {
  const idToRemove = req.params.id; // Az URL-ből érkezik

  try {
    // Ellenőrizzük, hogy a törölni kívánt azonosítóval regisztráltak-e már!
    // Ha valaki már használja ezt az azonosítót, a MySQL RESTRICT megkötése amúgy is hibát dobna, de szebb ezt így lekezelni.
    const userInUse = await db.query(
      'SELECT id FROM users WHERE oktatasi_azonosito = ?', 
      [idToRemove]
    );

    if (userInUse.length > 0) {
      return res.status(400).json({ 
        message: 'Ezt az azonosítót nem törölheted, mert egy regisztrált felhasználó már használja!' 
      });
    }

    // Törlés
    const result = await db.query(
      'DELETE FROM valid_education_ids WHERE oktatasi_azonosito = ?', 
      [idToRemove]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Az azonosító nem található a listában!' });
    }

    res.json({ message: 'Az oktatási azonosító sikeresen törölve a listából!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt az azonosító törlésekor.' });
  }
};