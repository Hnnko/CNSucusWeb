const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los items de una venta por código
router.get('/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const result = await db.query('SELECT * FROM item_venta WHERE codigo_venta = $1', [codigo]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Items de venta no encontrados' });
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener items de venta:', error);
    res.status(500).json({ error: 'Error al obtener items de venta' });
  }
});

// Crear un nuevo item a una venta.
router.post('/', async (req, res) => {
  try {
    const { codigo_item, codigo_venta, codigo_producto, producto, cantidad, monto_total} = req.body;
    const result = await db.query(
      'INSERT INTO item_venta (codigo_item, codigo_venta, codigo_producto, producto, cantidad, monto_total) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [codigo_item, codigo_venta, codigo_producto, producto, cantidad, monto_total]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear item venta:', error);
    res.status(500).json({ error: 'Error al crear item venta' });
  }
});

// Actualizar un item de venta por código
router.put('/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const { codigo_venta, codigo_producto, producto, cantidad, monto_total } = req.body;
    const result = await db.query(
      'UPDATE item_venta SET codigo_venta = $1, codigo_producto = $2, producto = $3, cantidad = $4, monto_total = $5 WHERE codigo_item = $6 RETURNING *',
      [codigo_venta, codigo_producto, producto, cantidad, monto_total, codigo]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item de venta no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar item venta:', error);
    res.status(500).json({ error: 'Error al actualizar item venta' });
  }
});

// Eliminar un item de venta por código
router.delete('/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const result = await db.query('DELETE FROM item_venta WHERE codigo_item = $1 RETURNING *', [codigo]);

    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item de venta no encontrado' });
    }
    
    res.json({ message: 'Item de venta eliminado exitosamente', item_venta: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar item venta:', error);
    res.status(500).json({ error: 'Error al eliminar item venta' });
  }
});

module.exports = router;