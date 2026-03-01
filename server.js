const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Importar rutas
const reservationsRoutes = require('./routes/reservations');
const tablesRoutes = require('./routes/tables');

// Usar rutas
app.use('/api/reservations', reservationsRoutes);
app.use('/api/tables', tablesRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message 
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Click&Eat corriendo en http://localhost:${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api`);
});

module.exports = app;
