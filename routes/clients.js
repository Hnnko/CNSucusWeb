const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clientes');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;