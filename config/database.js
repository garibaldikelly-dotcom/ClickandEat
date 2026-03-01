const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'clickandeat',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Verificar la conexión
pool.on('connect', () => {
    console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Error en la conexión a PostgreSQL:', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
