CREATE DATABASE IF NOT EXISTS langileak_db;

USE langileak_db;

CREATE TABLE IF NOT EXISTS usuarios (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(255) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL

);

INSERT INTO usuarios (username, password)
VALUES ('maialen', '1234');

INSERT INTO usuarios (username, password)
VALUES ('langile', 'pbl2026');

INSERT INTO usuarios (username, password)
VALUES ('admin', 'admin123');