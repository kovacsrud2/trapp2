const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes'); 
const eventRoutes = require('./routes/eventRoutes');
//08.13
const userRoutes = require('./routes/userRoutes');
const whitelistRoutes = require('./routes/whitelistRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Útvonalak regisztrálása
app.use('/api/auth', authRoutes); 
app.use('/api/events', eventRoutes);
//08.13
app.use('/api/users', userRoutes);
app.use('/api/whitelist', whitelistRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Az Eseménykezelő API működik!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`A szerver fut a http://localhost:${PORT} címen`);
});