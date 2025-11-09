-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Roles for RBAC
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Waste Types
CREATE TABLE waste_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Collection Points
CREATE TABLE collection_points (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL, -- PostGIS point with SRID 4326 (WGS84)
    local_government_area VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Subscribers (Business/Industrial customers)
CREATE TABLE subscribers (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(200) NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    contact_person VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    collection_point_id INTEGER REFERENCES collection_points(id),
    service_category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Users (Municipal Staff)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Collection Events
CREATE TABLE collection_events (
    id SERIAL PRIMARY KEY,
    collection_point_id INTEGER REFERENCES collection_points(id),
    waste_type_id INTEGER REFERENCES waste_types(id),
    collection_date DATE NOT NULL,
    volume_cubic_meters DECIMAL(10,2) NOT NULL,
    weight_tons DECIMAL(10,2) NOT NULL,
    crew_members JSONB NOT NULL,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    changes JSONB NOT NULL,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_collection_points_timestamp BEFORE UPDATE ON collection_points FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_subscribers_timestamp BEFORE UPDATE ON subscribers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_roles_timestamp BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_waste_types_timestamp BEFORE UPDATE ON waste_types FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_collection_events_timestamp BEFORE UPDATE ON collection_events FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_audit_logs_timestamp BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION update_timestamp();
