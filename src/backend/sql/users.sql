CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash CHAR(60) NOT NULL, -- For bcrypt hashing (60 chars)
    avatar_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token CHAR(64) DEFAULT NULL, -- For email verification
    date_of_birth DATE DEFAULT NULL,
    first_name VARCHAR(100) DEFAULT NULL,
    last_name VARCHAR(100) DEFAULT NULL,
    role ENUM('user', 'admin', 'moderator') DEFAULT 'user'
);

CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_created_at ON users(created_at);
