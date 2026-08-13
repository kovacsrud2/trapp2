const bcrypt = require('bcrypt');
const db = require('../config/db'); // Az adatbázis kapcsolat

async function fixPasswords() {
  const plainPassword = 'Titok_12';

  try {
    // 1. Legeneráljuk a VALÓDI bcrypt hash-t
    const saltRounds = 10;
    const validHash = await bcrypt.hash(plainPassword, saltRounds);

    // 2. Frissítjük az összes felhasználót erre a helyes hash-re
    await db.query('UPDATE users SET password_hash = ?', [validHash]);

    console.log('✅ Az összes felhasználó jelszava sikeresen javítva a valódi bcrypt hash-re!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hiba történt:', error.message);
    process.exit(1);
  }
}

fixPasswords();