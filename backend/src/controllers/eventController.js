const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// 1. Összes esemény lekérdezése
exports.getAllEvents = async (req, res) => {
  try {
    // Lekérjük az eseményeket, és hozzácsatoljuk a tanár nevét is
    const query = `
      SELECT e.id, e.title, e.description, e.date_time, e.location, e.max_participants, e.teacher_id, u.name AS teacher_name 
      FROM events e 
      JOIN users u ON e.teacher_id = u.id 
      ORDER BY e.date_time ASC
    `;
    const events = await db.query(query);
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt az események lekérdezésekor.' });
  }
};

// 2. Új esemény létrehozása (csak tanárok/adminok hívhatják)
exports.createEvent = async (req, res) => {
  const { title, description, date_time, location, max_participants } = req.body;
  const teacher_id = req.user.id; // A tokennel bejelentkezett felhasználó azonosítója
  const event_id = uuidv4();

  try {
    const query = `
      INSERT INTO events (id, title, description, date_time, location, max_participants, teacher_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.query(query, [
      event_id, 
      title, 
      description, 
      date_time, 
      location, 
      max_participants || null, 
      teacher_id
    ]);

    res.status(201).json({ 
      message: 'Esemény sikeresen létrehozva!',
      eventId: event_id 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt az esemény létrehozásakor.' });
  }
};

// POST /api/events/:id/register
exports.registerForEvent = async (req, res) => {
  const eventId = req.params.id; // Az URL-ből vesszük ki az esemény azonosítóját
  const studentId = req.user.id; // A tokenből vesszük ki a diák azonosítóját
  const registrationId = uuidv4();

  try {
    // 1. Lekérjük az eseményt, hogy megnézzük, létezik-e és van-e létszámkorlátja
    const events = await db.query('SELECT max_participants FROM events WHERE id = ?', [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Az esemény nem található!' });
    }
    
    const event = events[0];

    // 2. Létszámkorlát ellenőrzése (ha van beállítva)
    if (event.max_participants !== null) {
      const regs = await db.query('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [eventId]);
      const currentCount = regs[0].count; // MySQL esetén ez egy számot ad vissza
      
      if (currentCount >= event.max_participants) {
        return res.status(400).json({ message: 'Sajnos ez az esemény már betelt!' });
      }
    }

    // 3. Jelentkezés rögzítése az adatbázisban
    await db.query(
      'INSERT INTO registrations (id, student_id, event_id) VALUES (?, ?, ?)',
      [registrationId, studentId, eventId]
    );

    res.status(201).json({ message: 'Sikeresen feliratkoztál az eseményre!' });

  } catch (error) {
    // Ha a diák már jelentkezett erre az eseményre, a MySQL 1062-es hibakódot (ER_DUP_ENTRY) dob
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Már jelentkeztél erre az eseményre!' });
    }
    
    console.error(error);
    res.status(500).json({ message: 'Hiba történt a jelentkezés során.' });
  }
};

// DELETE /api/events/:id/register
exports.unregisterFromEvent = async (req, res) => {
  const eventId = req.params.id;
  const studentId = req.user.id;

  try {
    // 1. Lekérjük az eseményt, hogy megnézzük a dátumát
    const events = await db.query('SELECT date_time FROM events WHERE id = ?', [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Az esemény nem található!' });
    }

    // 2. Dátum ellenőrzése: Elkezdődött már?
    const eventDate = new Date(events[0].date_time);
    const currentDate = new Date();

    if (eventDate <= currentDate) {
      return res.status(400).json({ 
        message: 'Az esemény már elkezdődött (vagy véget ért), így nem tudsz leiratkozni róla!' 
      });
    }

    // 3. Leiratkozás (sor törlése a kapcsolótáblából)
    // A MySQL a törlésnél visszaad egy objektumot, amiből látszik, hány sort érintett (affectedRows)
    const result = await db.query(
      'DELETE FROM registrations WHERE student_id = ? AND event_id = ?',
      [studentId, eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Nem voltál feliratkozva erre az eseményre!' });
    }

    res.json({ message: 'Sikeresen leiratkoztál az eseményről!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt a leiratkozás során.' });
  }
};


//---------------------
//Egy adott tanár eseményeire feliratkozott tanulók
// GET /api/events/:id/participants
exports.getEventParticipants = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // 1. Ellenőrizzük, hogy létezik-e az esemény, és ki a tulajdonosa
    const events = await db.query('SELECT teacher_id FROM events WHERE id = ?', [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Az esemény nem található!' });
    }

    // 2. Jogosultság ellenőrzése: Csak a saját eseményét láthatja a tanár (az admin kivételével)
    if (userRole !== 'admin' && events[0].teacher_id !== userId) {
      return res.status(403).json({ 
        message: 'Nincs jogosultságod megtekinteni egy másik tanár eseményének jelentkezőit!' 
      });
    }

    // 3. Lekérdezzük a jelentkezőket a users és registrations táblák összekapcsolásával (JOIN)
    const query = `
      SELECT u.name, u.oktatasi_azonosito, r.registered_at 
      FROM registrations r
      JOIN users u ON r.student_id = u.id
      WHERE r.event_id = ?
      ORDER BY u.name ASC
    `;
    
    const participants = await db.query(query, [eventId]);

    // A válasz egy lista lesz a résztvevők adataival
    res.json(participants);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt a jelentkezők lekérdezésekor.' });
  }
};

//08.13

// PUT /api/events/:id - Esemény módosítása
exports.updateEvent = async (req, res) => {
  const eventId = req.params.id;
  const { title, description, date_time, location, max_participants } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // 1. Megkeressük az eseményt
    const events = await db.query('SELECT teacher_id FROM events WHERE id = ?', [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Az esemény nem található!' });
    }

    // 2. Jogosultság ellenőrzése (Admin mindent, tanár csak a sajátját)
    if (userRole !== 'admin' && events[0].teacher_id !== userId) {
      return res.status(403).json({ 
        message: 'Nincs jogosultságod módosítani ezt az eseményt!' 
      });
    }

    // 3. Adatok frissítése
    const updateQuery = `
      UPDATE events 
      SET title = ?, description = ?, date_time = ?, location = ?, max_participants = ?
      WHERE id = ?
    `;
    
    await db.query(updateQuery, [
      title, 
      description, 
      date_time, 
      location, 
      max_participants || null, 
      eventId
    ]);

    res.json({ message: 'Az esemény adatai sikeresen frissítve!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt az esemény módosításakor.' });
  }
};

// DELETE /api/events/:id - Esemény törlése
exports.deleteEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // 1. Megkeressük az eseményt
    const events = await db.query('SELECT teacher_id FROM events WHERE id = ?', [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Az esemény nem található!' });
    }

    // 2. Jogosultság ellenőrzése
    if (userRole !== 'admin' && events[0].teacher_id !== userId) {
      return res.status(403).json({ 
        message: 'Nincs jogosultságod törölni ezt az eseményt!' 
      });
    }

    // 3. Törlés (A CASCADE miatt a jelentkezések is automatikusan törlődnek!)
    await db.query('DELETE FROM events WHERE id = ?', [eventId]);

    res.json({ message: 'Az esemény (és a hozzá tartozó jelentkezések) sikeresen törölve!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hiba történt az esemény törlésekor.' });
  }
};

//Itt már kívül volt az AI a kontextuson

// Események lekérdezése, amikre a bejelentkezett diák jelentkezett
{/*exports.getMyRegisteredEvents = async (req, res) => {
  try {
    // Az auth middleware-ből érkező felhasználó azonosító (diák ID)
    const studentId = req.user.id; 

    // SQL lekérdezés: Összekapcsoljuk az eseményeket a jelentkezésekkel
    const query = `
      SELECT 
        e.id AS event_id,
        e.title,
        e.description,
        e.date_time,
        e.location,
        e.max_participants,
        e.teacher_id,
        e.created_at,
        e.updated_at,
        r.id AS registration_id,
        r.registered_at
      FROM events e
      INNER JOIN registrations r ON e.id = r.event_id
      WHERE r.student_id = ?
      ORDER BY e.date_time DESC;
    `;

    // Adatbázis hívás (MySQL mysql2 csomaggal vagy SQLite-tal)
    // Ha db.query-t használsz mysql2-vel:
    const [myEvents] = await db.query(query, [studentId]);
    console.log("MySQL által visszakadott nyers adatok:", myEvents);

    // Ha SQLite-ot használsz, valahogy így néz ki:
    // const myEvents = await db.all(query, [studentId]);

    res.status(200).json(myEvents);

  } catch (error) {
    console.error("Hiba a saját események lekérésekor:", error);
    res.status(500).json({ error: "Szerverhiba történt az események betöltésekor." });
  }
};*/}

exports.getMyRegisteredEvents = async (req, res) => {
  try {
    const studentId = req.user.id; 

    const query = `
      SELECT 
        e.*,
        r.id AS registration_id,
        r.registered_at
      FROM events e
      INNER JOIN registrations r ON e.id = r.event_id
      WHERE r.student_id = ?
      ORDER BY e.date_time DESC;
    `;

    const result = await db.query(query, [studentId]);

    // Biztosítjuk, hogy függetlenül a driver struktúrájától, tiszta tömböt kapjunk vissza
    const myEvents = Array.isArray(result[0]) ? result[0] : (Array.isArray(result) ? result : []);

    console.log("Sikeresen lekérdezett események száma:", myEvents.length);

    res.status(200).json(myEvents);
  } catch (error) {
    console.error("Hiba a saját események lekérésekor:", error);
    res.status(500).json({ error: "Szerverhiba történt az események betöltésekor." });
  }
};