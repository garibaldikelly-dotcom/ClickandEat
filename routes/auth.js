const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'clickandeat-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h';

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Usuario y contraseña son requeridos'
            });
        }
        
        // Buscar usuario
        const result = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Usuario o contraseña incorrectos'
            });
        }
        
        const user = result.rows[0];
        
        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Usuario o contraseña incorrectos'
            });
        }
        
        // Generar token JWT
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );
        
        // Guardar sesión en la base de datos
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
        await db.query(
            'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, token, expiresAt]
        );
        
        // Eliminar sesiones expiradas del usuario
        await db.query(
            'DELETE FROM sessions WHERE user_id = $1 AND expires_at < NOW()',
            [user.id]
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor',
            message: error.message
        });
    }
});

// Verificar token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token no proporcionado'
            });
        }
        
        // Verificar token en la base de datos
        const sessionResult = await db.query(
            'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
            [token]
        );
        
        if (sessionResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Sesión inválida o expirada'
            });
        }
        
        // Verificar JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Obtener datos del usuario
        const userResult = await db.query(
            'SELECT id, username, full_name, email, role FROM users WHERE id = $1',
            [decoded.userId]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            user: {
                id: userResult.rows[0].id,
                username: userResult.rows[0].username,
                fullName: userResult.rows[0].full_name,
                email: userResult.rows[0].email,
                role: userResult.rows[0].role
            }
        });
    } catch (error) {
        console.error('Error al verificar token:', error);
        res.status(401).json({
            success: false,
            error: 'Token inválido',
            message: error.message
        });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            // Eliminar sesión de la base de datos
            await db.query('DELETE FROM sessions WHERE token = $1', [token]);
        }
        
        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cerrar sesión',
            message: error.message
        });
    }
});

// Hashear contraseña (útil para crear nuevos usuarios)
router.post('/hash-password', async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Contraseña es requerida'
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        res.json({
            success: true,
            hashedPassword
        });
    } catch (error) {
        console.error('Error al hashear contraseña:', error);
        res.status(500).json({
            success: false,
            error: 'Error al hashear contraseña',
            message: error.message
        });
    }
});

// Middleware para verificar autenticación
const authenticateToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Acceso no autorizado'
            });
        }
        
        // Verificar token en la base de datos
        const sessionResult = await db.query(
            'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
            [token]
        );
        
        if (sessionResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Sesión inválida o expirada'
            });
        }
        
        // Verificar JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Token inválido'
        });
    }
};

module.exports = router;
module.exports.authenticateToken = authenticateToken;
