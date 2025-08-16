const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todas las ventas
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM ventas');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva venta
router.post('/', async (req, res) => {
  try {
    const { codigo_venta, codigo_cliente, cliente, fecha_venta, metodo_pago, monto_neto, iva, monto_total} = req.body;
    const result = await db.query(
      'INSERT INTO ventas (codigo_venta, codigo_cliente, cliente, fecha_venta, metodo_pago, monto_neto, iva, monto_total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [codigo_venta, codigo_cliente, cliente, fecha_venta, metodo_pago, monto_neto, iva, monto_total]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(500).json({ error: 'Error al crear venta' });
  }
});

// Actualizar una venta por código
router.put('/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const { codigo_cliente, cliente, fecha_venta, metodo_pago, monto_neto, iva, monto_total } = req.body;
    const result = await db.query(
      'UPDATE ventas SET codigo_cliente = $1, cliente = $2, fecha_venta = $3, metodo_pago = $4, monto_neto = $5, iva = $6, monto_total = $7 WHERE codigo_venta = $8 RETURNING *',
      [codigo_cliente, cliente, fecha_venta, metodo_pago, monto_neto, iva, monto_total, codigo]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar venta:', error);
    res.status(500).json({ error: 'Error al actualizar venta' });
  }
});

// Eliminar una venta por código
router.delete('/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const result = await db.query('DELETE FROM ventas WHERE codigo_venta = $1 RETURNING *', [codigo]);

    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    res.json({ message: 'Venta eliminada exitosamente', venta: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar venta:', error);
    res.status(500).json({ error: 'Error al eliminar venta' });
  }
});

module.exports = router;