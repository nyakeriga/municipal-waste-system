-- Spatial indexes
CREATE INDEX idx_collection_points_location ON collection_points USING GIST (location);
CREATE INDEX idx_subscribers_location ON subscribers USING GIST (location);

-- Regular indexes for foreign keys and frequently queried fields
CREATE INDEX idx_subscribers_collection_point ON subscribers(collection_point_id);
CREATE INDEX idx_collection_events_collection_point ON collection_events(collection_point_id);
CREATE INDEX idx_collection_events_waste_type ON collection_events(waste_type_id);
CREATE INDEX idx_collection_events_date ON collection_events(collection_date);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_users_role ON users(role_id);

-- Text search indexes
CREATE INDEX idx_collection_points_name_trgm ON collection_points USING gin (name gin_trgm_ops);
CREATE INDEX idx_subscribers_business_name_trgm ON subscribers USING gin (business_name gin_trgm_ops);
