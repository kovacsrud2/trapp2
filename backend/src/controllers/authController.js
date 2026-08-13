const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid'); //Új sor


// REGISZTRÁCIÓ
exports.register = async (req, res) => {
  const { oktatasi_azonosito, name, email, password } = req.body;

  try {
    // 1. Szerepel-e az oktatási azonosító a fehérlistán (whitelist)?
    const validIds = await db.query(
      'SELECT * FROM valid_education_ids WHERE oktatasi_azonosito = ?', 
      [oktatasi_azonosito]
    );

    if (validIds.length === 0) {
      return res.status(403).json({ 
        message: 'Érvénytelen vagy nem regisztrálható oktatási azonosító!' 
      });
    }

    // 2. Ellenőrizzük, hogy foglalt-e már az e-mail vagy az azonosító
    const existingUsers = await db.query(
      'SELECT * FROM users WHERE email = ? OR oktatasi_azonosito = ?',
      [email, oktatasi_azonosito]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        message: 'Ezzel az e-mail címmel vagy oktatási azonosítóval már regisztráltak!' 
      });
    }

    // 3. Jelszó titkosítása
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Új felhasználó mentése az adatbázisba (alapértelmezett szerepkör: student)
    const userId = uuidv4();
    await db.query(
      `INSERT INTO users (id, oktatasi_azonosito, name, email, password_hash, role) 
       VALUES (?, ?, ?, ?, ?, 'student')`,
      [userId, oktatasi_azonosito, name, email, passwordHash]
    );

    res.status(201).json({ 
      message: 'Sikeres regisztráció! Most már bejelentkezhetsz.' 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Szerverhiba történt a regisztráció során.' });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Felhasználó keresése e-mail alapján
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Hibás e-mail cím vagy jelszó!' });
    }

    const user = users[0];

    // 2. Jelszó ellenőrzése
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Hibás e-mail cím vagy jelszó!' });
    }

    // 3. JWT Token generálása (beleteszünk minden fontos infót)
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        oktatasi_azonosito: user.oktatasi_azonosito 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // 8 óráig érvényes
    );

    // 4. Sikeres válasz visszaküldése (a jelszót sosem küldjük vissza!)
    res.json({
      message: 'Sikeres bejelentkezés!',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Szerverhiba történt a bejelentkezés során.' });
  }
};