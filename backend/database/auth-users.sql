-- User Authentication Table (PostgreSQL)
-- Note: updated_at auto-update is handled by the set_updated_at() trigger
-- defined in init-postgres.sql.
CREATE TABLE IF NOT EXISTS auth_users (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active SMALLINT DEFAULT 1,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_users_employee_id ON auth_users (employee_id);
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users (email);
