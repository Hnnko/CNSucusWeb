const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM productos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    const { codigo, nombre, costo, stock } = req.body;
    const result = await db.query(
      'INSERT INTO productos (codigo, nombre, costo, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [codigo, nombre, costo, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un producto por código
router.put('/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const { nombre, costo, stock } = req.body;
    const result = await db.query(
      'UPDATE productos SET nombre = $1, costo = $2, stock = $3 WHERE codigo = $4 RETURNING *',
      [nombre, costo, stock, codigo]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un producto por código
router.delete('/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const result = await db.query('DELETE FROM productos WHERE codigo = $1 RETURNING *', [codigo]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ message: 'Producto eliminado exitosamente', producto: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;