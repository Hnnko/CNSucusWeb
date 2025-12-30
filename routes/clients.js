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

// Crear un nuevo cliente
router.post('/', async (req, res) => {
  try {
    const { rut, cliente, email, telefono } = req.body;
    const checkClient = await db.query('SELECT * FROM clientes WHERE rut = $1', [rut]);
    
    if (checkClient.rows.length > 0) {
      // Si ya existe, devolvemos error 400 (Bad Request) y salimos de la función
      return res.status(400).json({ error: 'El cliente con este RUT ya existe' });
    }
    
    const result = await db.query(
      'INSERT INTO clientes (rut, cliente, email, telefono) VALUES ($1, $2, $3, $4) RETURNING *',
      [rut, cliente, email, telefono]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un cliente por RUT
router.put('/:rut', async (req, res) => {
  try {
    const { rut } = req.params;
    const { cliente, email, telefono } = req.body;
    const result = await db.query(
      'UPDATE clientes SET cliente = $1, email = $2, telefono = $3 WHERE rut = $4 RETURNING *',
      [cliente, email, telefono, rut]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un cliente por RUT
router.delete('/:rut', async (req, res) => {
  try {
    const { rut } = req.params;
    const result = await db.query('DELETE FROM clientes WHERE rut = $1 RETURNING *', [rut]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json({ message: 'Cliente eliminado exitosamente', cliente: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;