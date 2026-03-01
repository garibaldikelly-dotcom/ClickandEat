const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todas las reservas por fecha
router.get('/', async (req, res) => {
    try {
        const { date } = req.query;
        const queryDate = date || new Date().toISOString().split('T')[0];
        
        const result = await db.query(
            'SELECT * FROM reservations WHERE date = $1 ORDER BY time ASC',
            [queryDate]
        );
        
        res.json({
            success: true,
            reservations: result.rows
        });
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener reservas',
            message: error.message
        });
    }
});

// Crear una nueva reserva
router.post('/', async (req, res) => {
    try {
        const { date, time, guests, name, phone, email, table } = req.body;
        
        // Validar campos requeridos
        if (!date || !time || !guests || !name || !table) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos'
            });
        }
        
        // Verificar si la mesa está disponible
        const existingReservation = await db.query(
            'SELECT * FROM reservations WHERE date = $1 AND time = $2 AND table_number = $3',
            [date, time, table]
        );
        
        if (existingReservation.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'La mesa ya está reservada para esa hora'
            });
        }
        
        // Crear la reserva
        const result = await db.query(
            `INSERT INTO reservations (date, time, guests, name, phone, email, table_number, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [date, time, guests, name, phone || '', email || '', table, 'confirmed']
        );
        
        // Actualizar estado de la mesa
        await db.query(
            'UPDATE tables SET status = $1, reservation_id = $2 WHERE table_number = $3',
            ['occupied', result.rows[0].id, table]
        );
        
        res.status(201).json({
            success: true,
            reservation: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear reserva',
            message: error.message
        });
    }
});

// Obtener una reserva específica
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'SELECT * FROM reservations WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Reserva no encontrada'
            });
        }
        
        res.json({
            success: true,
            reservation: result.rows[0]
        });
    } catch (error) {
        console.error('Error al obtener reserva:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener reserva',
            message: error.message
        });
    }
});

// Actualizar una reserva
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const result = await db.query(
            'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Reserva no encontrada'
            });
        }
        
        res.json({
            success: true,
            reservation: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar reserva:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar reserva',
            message: error.message
        });
    }
});

// Eliminar una reserva
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener información de la reserva antes de eliminarla
        const reservation = await db.query(
            'SELECT table_number FROM reservations WHERE id = $1',
            [id]
        );
        
        if (reservation.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Reserva no encontrada'
            });
        }
        
        // Liberar la mesa
        await db.query(
            'UPDATE tables SET status = $1, reservation_id = NULL WHERE table_number = $2',
            ['available', reservation.rows[0].table_number]
        );
        
        // Eliminar la reserva
        await db.query('DELETE FROM reservations WHERE id = $1', [id]);
        
        res.json({
            success: true,
            message: 'Reserva eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar reserva:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar reserva',
            message: error.message
        });
    }
});

module.exports = router;
