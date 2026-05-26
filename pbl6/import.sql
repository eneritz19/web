-- 1. Crear la base de datos si no existe (llámala como quieras, por ejemplo, langileak_db)
CREATE DATABASE IF NOT EXISTS langileak_db;

-- 2. Decirle al programa que use esta base de datos a partir de ahora
USE langileak_db;

-- 3. Crear la tabla dentro de esa base de datos
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 4. Insertar los datos de prueba
INSERT INTO usuarios (username, password) VALUES ('maialen', '1234');
INSERT INTO usuarios (username, password) VALUES ('langile', 'pbl2026');
INSERT INTO usuarios (username, password) VALUES ('admin', 'admin123');
-- 5. Comprobar que se han guardado
SELECT * FROM usuarios;