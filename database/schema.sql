-- Crear la base de datos
CREATE DATABASE clickandeat;

-- Conectarse a la base de datos
\c clickandeat;

-- Tabla de reservas
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    guests INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    table_number INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mesas
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    table_number INTEGER UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar mesas iniciales (9 mesas)
INSERT INTO tables (table_number, capacity, status) VALUES
(1, 2, 'available'),
(2, 2, 'available'),
(3, 4, 'available'),
(4, 4, 'available'),
(5, 4, 'available'),
(6, 6, 'available'),
(7, 6, 'available'),
(8, 8, 'available'),
(9, 8, 'available');

-- Índices para mejorar el rendimiento
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_time ON reservations(time);
CREATE INDEX idx_tables_status ON tables(status);

-- Función para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
