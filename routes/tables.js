const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todas las mesas
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM tables ORDER BY table_number ASC'
        );
        
        res.json({
            success: true,
            tables: result.rows
        });
    } catch (error) {
        console.error('Error al obtener mesas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener mesas',
            message: error.message
        });
    }
});

// Actualizar estado de una mesa
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reservation_id } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'El estado es requerido'
            });
        }
        
        const result = await db.query(
            'UPDATE tables SET status = $1, reservation_id = $2 WHERE table_number = $3 RETURNING *',
            [status, reservation_id || null, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Mesa no encontrada'
            });
        }
        
        res.json({
            success: true,
            table: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar mesa:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar mesa',
            message: error.message
        });
    }
});

module.exports = router;