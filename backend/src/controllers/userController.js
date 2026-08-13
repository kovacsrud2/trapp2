const db = require('../config/db');
const bcrypt = require('bcrypt'); 

//08.13
// GET /api/users/profile - Saját profil lekérdezése
exports.getProfile = async (req, res) => {
  const userId = req.user.id; // A tokenből jön, amit az authMiddleware rakott be

  try {
    // Lekérdezzük a felhasználó minden adatát, kivéve a password_hash-t!
    const users = await db.query(
      'SELECT id, oktatasi_azonosito, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'A felhasználó nem található!' });
    }

    // Visszaküldjük a megtalált felhasználó adatait
    res.json(users[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt a profil lekérdezésekor.' });
  }
};

//08.13
// PUT /api/users/profile - Saját profil adatainak (név, email) módosítása
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  // Kizárólag a nevet és az e-mailt vesszük ki a kérésből!
  const { name, email } = req.body;

  // Alapvető validáció
  if (!name || !email) {
    return res.status(400).json({ message: 'A név és az e-mail cím megadása kötelező!' });
  }

  try {
    // 1. Ellenőrizzük, hogy az új e-mail cím foglalt-e már (és nem a saját régi címe)
    const emailCheck = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?', 
      [email, userId]
    );

    if (emailCheck.length > 0) {
      return res.status(409).json({ message: 'Ez az e-mail cím már használatban van!' });
    }

    // 2. Frissítjük a profiladatokat
    await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, userId]
    );

    res.json({ message: 'A profiladatok sikeresen frissítve!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt a profil frissítésekor.' });
  }
};

//08.13
// PUT /api/users/password - Jelszó módosítása
exports.updatePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  // 1. Alapvető validáció
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'A régi és az új jelszó megadása is kötelező!' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Az új jelszónak legalább 6 karakter hosszúnak kell lennie!' });
  }

  try {
    // 2. Lekérjük a felhasználó jelenlegi (titkosított) jelszavát az adatbázisból
    const users = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'A felhasználó nem található!' });
    }

    const user = users[0];

    // 3. Ellenőrizzük, hogy a megadott "régi jelszó" tényleg helyes-e
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'A megadott régi jelszó helytelen!' });
    }

    // 4. Ha helyes, titkosítjuk az új jelszót
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 5. Elmentjük az új titkosított jelszót az adatbázisba
    await db.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.json({ message: 'A jelszó sikeresen megváltoztatva!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt a jelszó frissítésekor.' });
  }
};

//08.13
//Admin funkciók
// GET /api/users - Összes felhasználó lekérdezése (Csak Admin)
exports.getAllUsers = async (req, res) => {
  try {
    // Lekérjük a felhasználókat, de a jelszavakat (password_hash) itt sem adjuk ki!
    const users = await db.query(
      'SELECT id, oktatasi_azonosito, name, email, role, created_at FROM users ORDER BY name ASC'
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt a felhasználók lekérdezésekor.' });
  }
};

// PUT /api/users/:id/role - Felhasználó szerepkörének módosítása (Csak Admin)
exports.updateUserRole = async (req, res) => {
  const targetUserId = req.params.id; // Annak a felhasználónak az ID-ja, akit módosítunk
  const { role } = req.body;

  // Ellenőrizzük, hogy érvényes szerepkört kaptunk-e
  const validRoles = ['student', 'teacher', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Érvénytelen szerepkör! (student, teacher, admin lehet)' });
  }

  try {
    // Ellenőrizzük, hogy létezik-e a felhasználó
    const users = await db.query('SELECT id FROM users WHERE id = ?', [targetUserId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'A felhasználó nem található!' });
    }

    // Biztonsági védelem: Az admin ne tudja véletlenül elvenni a saját admin jogát
    if (targetUserId === req.user.id && role !== 'admin') {
      return res.status(400).json({ message: 'Saját magadtól nem veheted el az adminisztrátori jogot!' });
    }

    // Szerepkör frissítése
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, targetUserId]);

    res.json({ message: `A felhasználó szerepköre sikeresen módosítva erre: ${role}` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt a szerepkör frissítésekor.' });
  }
};

