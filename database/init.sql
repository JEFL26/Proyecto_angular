CREATE DATABASE IF NOT EXISTS beauty_center;
USE beauty_center;

CREATE TABLE role (
    id_role INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre del rol: empleado, cliente',
    description VARCHAR(100),
    state BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_role_name ON role (name);

CREATE TABLE user_account (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    id_role INT NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_logged_in BOOLEAN NOT NULL DEFAULT FALSE,
    state BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_role) REFERENCES role(id_role)
);

CREATE INDEX idx_user_email ON user_account (email);
CREATE INDEX idx_user_role ON user_account (id_role);

CREATE TABLE user_profile (
    id_profile INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    state BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_user) REFERENCES user_account(id_user)
);

CREATE INDEX idx_profile_user ON user_profile (id_user);

CREATE TABLE service (
    id_service INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    state BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_service_name ON service (name);

CREATE TABLE reservation_status (
    id_reservation_status INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Pendiente, Confirmado, Cancelado, Completado',
    state BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE reservation (
    id_reservation INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL COMMENT 'Cliente que hizo la reserva',
    id_service INT NOT NULL,
    id_reservation_status INT NOT NULL DEFAULT 1,
    scheduled_datetime DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL COMMENT 'ej., Efectivo, Tarjeta, Transferencia (ficticio)',
    state BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_user) REFERENCES user_account(id_user),
    FOREIGN KEY (id_service) REFERENCES service(id_service),
    FOREIGN KEY (id_reservation_status) REFERENCES reservation_status(id_reservation_status)
);

CREATE INDEX idx_reservation_user ON reservation (id_user);
CREATE INDEX idx_reservation_service ON reservation (id_service);
CREATE INDEX idx_reservation_date ON reservation (scheduled_datetime);

CREATE TABLE reminder (
    id_reminder INT AUTO_INCREMENT PRIMARY KEY,
    id_reservation INT NOT NULL,
    reminder_datetime DATETIME NOT NULL COMMENT 'Cuándo enviar el recordatorio',
    message VARCHAR(255) NOT NULL COMMENT 'Mensaje de recordatorio para el cliente',
    state BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_reservation) REFERENCES reservation(id_reservation)
);

CREATE INDEX idx_reminder_reservation ON reminder (id_reservation);
CREATE INDEX idx_reminder_datetime ON reminder (reminder_datetime);





INSERT INTO role (name, description) VALUES
('empleado', 'Empleado del salón con acceso limitado'),
('cliente', 'Cliente que puede hacer reservas');


INSERT INTO user_account (id_role, email, password, is_logged_in, state)
VALUES (
    1,
    'admin@example.com',
    '$2b$12$toDoqsuu1QWr2TMAhy4WGORUbxnbddu6XIguPY90dZSC3tf70uLW6',  -- hash de 'admin123'
    FALSE,
    TRUE
);

INSERT INTO reservation_status (name) VALUES
('Pendiente'),
('Confirmado'),
('Cancelado'),
('Completado');