require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const loginRoutes = require('../backend/routes/login');

app.use('/login', loginRoutes);

// app.get('/status', async (req, res) => {
//   try {
//     await pool.query('SELECT NOW()');
//     res.json({ status: 'ok', database: 'conectado' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: 'erro', database: 'desconectado' });
//   }
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});