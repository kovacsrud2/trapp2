-- 1. Engedélyezett azonosítók táblája (Whitelist)
-- Ebbe a táblába az adminisztrátorok (vagy egy importáló script) töltik fel a diákok és tanárok 11 jegyű kódjait.
CREATE TABLE valid_education_ids (
    oktatasi_azonosito CHAR(11) PRIMARY KEY
);

-- 2. Felhasználók tábla
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    oktatasi_azonosito CHAR(11) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ez a sor garantálja, hogy csak a valid_education_ids táblában szereplő azonosítóval lehessen regisztrálni:
    FOREIGN KEY (oktatasi_azonosito) REFERENCES valid_education_ids(oktatasi_azonosito) ON DELETE RESTRICT
);

-- 3. Események tábla
CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date_time DATETIME NOT NULL,
    location VARCHAR(255),
    max_participants INT,
    teacher_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Jelentkezések (Kapcsolótábla)
CREATE TABLE registrations (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    event_id VARCHAR(36) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE(student_id, event_id)
);


-- 1. Engedélyezzük az admin oktatási azonosítóját (legyen ez most 11 darab nulla)
INSERT INTO valid_education_ids (oktatasi_azonosito) 
VALUES ('00000000000');

-- 2. Hozzuk létre az admin felhasználót
INSERT INTO users (id, oktatasi_azonosito, name, email, password_hash, role) 
VALUES (
    UUID(), 
    '00000000000', 
    'Fő Adminisztrátor', 
    'admin@suli.hu', 
    '$2b$10$wNnQvT9R.u.X/j7J7U5gEu/B0O.M7v.Q6Y9n.H5y3H.P3r7T3X6mS', -- A 'Titok_12' bcrypt hash-e
    'admin'
);

-- 1. Engedélyezzük az új oktatási azonosítókat (Whitelist bővítése)
INSERT INTO valid_education_ids (oktatasi_azonosito) 
VALUES 
    ('11111111111'), -- Kitalált azonosító a tanárnak
    ('22222222222'); -- Kitalált azonosító a tanulónak

-- 2. Hozzuk létre a tanár (teacher) felhasználót
INSERT INTO users (id, oktatasi_azonosito, name, email, password_hash, role) 
VALUES (
    UUID(), 
    '11111111111', 
    'Kovács Tanár Úr', 
    'kovacs.tanar@suli.hu', 
    '$2b$10$wNnQvT9R.u.X/j7J7U5gEu/B0O.M7v.Q6Y9n.H5y3H.P3r7T3X6mS', -- 'Titok_12' hash formátumban
    'teacher'
);

-- 3. Hozzuk létre a tanuló (student) felhasználót
INSERT INTO users (id, oktatasi_azonosito, name, email, password_hash, role) 
VALUES (
    UUID(), 
    '22222222222', 
    'Minta Diák', 
    'minta.diak@suli.hu', 
    '$2b$10$wNnQvT9R.u.X/j7J7U5gEu/B0O.M7v.Q6Y9n.H5y3H.P3r7T3X6mS', -- 'Titok_12' hash formátumban
    'student'
);


-- 1. Kikeressük a tanár azonosítóját az e-mail címe alapján, és eltároljuk egy memóriaváltozóban
SET @teacher_id = (SELECT id FROM users WHERE email = 'kovacs.tanar@suli.hu' LIMIT 1);

-- 2. Létrehozzuk a 3 eseményt, a @teacher_id változót használva létrehozóként
INSERT INTO events (id, title, description, date_time, location, max_participants, teacher_id) 
VALUES 
    (
        UUID(), 
        'Matematika Érettségi Felkészítő', 
        'Gyakorló feladatok és korábbi érettségi sorok megoldása közösen.', 
        '2026-09-15 15:00:00', 
        '204-es terem', 
        20, 
        @teacher_id
    ),
    (
        UUID(), 
        'Osztálykirándulás Megbeszélés', 
        'A tavaszi többnapos osztálykirándulás útvonalának és programjainak egyeztetése.', 
        '2026-09-18 14:00:00', 
        '101-es terem', 
        30, 
        @teacher_id
    ),
    (
        UUID(), 
        'Robotika Szakkör Kezdőknek', 
        'Alapvető programozási logikák elsajátítása és robotok építése.', 
        '2026-09-22 16:00:00', 
        'Informatika labor', 
        12, 
        @teacher_id
    );