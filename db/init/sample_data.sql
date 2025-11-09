-- Sample data for Municipal Waste Management System

-- Insert roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'System Administrator', '{"manage_users": true, "manage_collection_points": true, "manage_subscribers": true, "manage_collection_events": true, "view_reports": true, "view_audit_logs": true}'),
('manager', 'Municipal Manager', '{"manage_collection_points": true, "manage_subscribers": true, "manage_collection_events": true, "view_reports": true}'),
('operator', 'Field Operator', '{"manage_collection_events": true, "view_reports": false}'),
('viewer', 'Read-only Viewer', '{"view_reports": true}');

-- Insert waste types
INSERT INTO waste_types (name, description) VALUES
('General Waste', 'Mixed municipal solid waste'),
('Organic Waste', 'Food and garden waste'),
('Plastic Waste', 'Plastic materials and packaging'),
('Paper/Cardboard', 'Paper and cardboard materials'),
('Glass', 'Glass bottles and containers'),
('Metal', 'Metal cans and scrap'),
('Electronic Waste', 'Electronic devices and components'),
('Hazardous Waste', 'Chemicals and hazardous materials');

-- Insert sample collection points
INSERT INTO collection_points (name, address, location, local_government_area, notes) VALUES
('Central Business District Collection Point', '123 Main Street, CBD', ST_SetSRID(ST_MakePoint(36.821945, -1.292066), 4326), 'Central Business District', 'Main collection point for downtown area'),
('Westlands Transfer Station', '456 Westlands Road', ST_SetSRID(ST_MakePoint(36.7859, -1.2630), 4326), 'Westlands', 'Transfer station for western suburbs'),
('Eastlands Collection Center', '789 Eastlands Avenue', ST_SetSRID(ST_MakePoint(36.8901, -1.2833), 4326), 'Eastlands', 'Collection center for eastern suburbs'),
('South B Collection Point', '321 South B Road', ST_SetSRID(ST_MakePoint(36.8219, -1.3167), 4326), 'South B', 'Residential area collection point'),
('Karen Collection Facility', '654 Karen Road', ST_SetSRID(ST_MakePoint(36.7167, -1.3167), 4326), 'Karen', 'High-end residential collection facility'),
('River Road Transfer Station', '987 River Road', ST_SetSRID(ST_MakePoint(36.8219, -1.2833), 4326), 'River Road', 'Industrial area transfer station'),
('Lavington Collection Point', '147 Lavington Drive', ST_SetSRID(ST_MakePoint(36.7833, -1.2833), 4326), 'Lavington', 'Residential collection point'),
('Kilimani Transfer Station', '258 Kilimani Road', ST_SetSRID(ST_MakePoint(36.7833, -1.3000), 4326), 'Kilimani', 'Mixed residential-commercial area'),
('Parklands Collection Center', '369 Parklands Avenue', ST_SetSRID(ST_MakePoint(36.8167, -1.2667), 4326), 'Parklands', 'Residential collection center'),
('Westlands Mall Collection Point', '741 Westlands Mall', ST_SetSRID(ST_MakePoint(36.8094, -1.2658), 4326), 'Westlands', 'Shopping mall collection point');

-- Insert sample subscribers
INSERT INTO subscribers (business_name, business_type, contact_person, email, phone, address, location, collection_point_id, service_category) VALUES
('Java House CBD', 'restaurant', 'John Maina', 'manager@javahousecbd.co.ke', '+254700123456', '456 Luthuli Avenue, CBD', ST_SetSRID(ST_MakePoint(36.821945, -1.292066), 4326), 1, 'Commercial'),
('Koinange Street Hotel', 'hotel', 'Mary Wanjiku', 'frontdesk@koinangehotel.com', '+254700123457', '789 Koinange Street', ST_SetSRID(ST_MakePoint(36.8186, -1.2889), 4326), 1, 'Commercial'),
('Equity Bank Westlands', 'bank', 'David Kiprop', 'branch@equitybank.co.ke', '+254700123458', '123 Westlands Road', ST_SetSRID(ST_MakePoint(36.7859, -1.2630), 4326), 2, 'Financial'),
('Nairobi Hospital', 'hospital', 'Dr. Sarah Johnson', 'admin@nairobihospital.org', '+254700123459', 'Hospital Road, Upper Hill', ST_SetSRID(ST_MakePoint(36.8094, -1.2894), 4326), 1, 'Healthcare'),
('Sarit Centre', 'shopping_mall', 'Peter Kamau', 'facilities@saritcentre.com', '+254700123460', 'Westlands Road', ST_SetSRID(ST_MakePoint(36.8094, -1.2658), 4326), 2, 'Commercial'),
('TotalEnergies Karen', 'filling_station', 'Ahmed Hassan', 'manager@totalenergies.co.ke', '+254700123461', 'Karen Road', ST_SetSRID(ST_MakePoint(36.7167, -1.3167), 4326), 5, 'Commercial'),
(' Uchumi Hyper Karen', 'supermarket', 'Grace Wairimu', 'store@uchumihyper.co.ke', '+254700123462', 'Karen Shopping Centre', ST_SetSRID(ST_MakePoint(36.7167, -1.3167), 4326), 5, 'Commercial'),
('ABC Bank Eastlands', 'bank', 'Michael Oduya', 'eastlands@abc-bank.co.ke', '+254700123463', '456 Eastlands Road', ST_SetSRID(ST_MakePoint(36.8901, -1.2833), 4326), 3, 'Financial'),
('Kenya Power South B', 'utility_company', 'Lucy Ndungu', 'regional@kplc.co.ke', '+254700123464', '789 South B Road', ST_SetSRID(ST_MakePoint(36.8219, -1.3167), 4326), 4, 'Utility'),
('KFC River Road', 'restaurant', 'Robert Kipkoech', 'manager@kfc.co.ke', '+254700123465', 'River Road Mall', ST_SetSRID(ST_MakePoint(36.8219, -1.2833), 4326), 6, 'Commercial'),
('Nation Media Group', 'media_company', 'Ann Wanjohi', 'facilities@nmg.co.ke', '+254700123466', 'Luthuli Avenue', ST_SetSRID(ST_MakePoint(36.821945, -1.292066), 4326), 1, 'Corporate'),
('IBM Kenya', 'technology_company', 'James Mwangi', 'facilities@ibm.co.ke', '+254700123467', 'Westlands Road', ST_SetSRID(ST_MakePoint(36.7859, -1.2630), 4326), 2, 'Corporate'),
('University of Nairobi', 'educational_institution', 'Prof. David Okeyo', 'facilities@uonbi.ac.ke', '+254700123468', 'University Way', ST_SetSRID(ST_MakePoint(36.8167, -1.2833), 4326), 6, 'Educational'),
('Kenyatta International Hospital', 'hospital', 'Dr. Paul Mbugua', 'admin@kih.co.ke', '+254700123469', 'Luthuli Avenue', ST_SetSRID(ST_MakePoint(36.821945, -1.292066), 4326), 1, 'Healthcare'),
('Two Rivers Mall', 'shopping_mall', 'Susan Kiprop', 'facilities@tworiversmall.com', '+254700123470', 'Limuru Road', ST_SetSRID(ST_MakePoint(36.7833, -1.2833), 4326), 7, 'Commercial');

-- Insert sample users
INSERT INTO users (username, email, password_hash, full_name, role_id) VALUES
('admin', 'admin@municipal.go.ke', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYKCX8F1tO', 'System Administrator', 1), -- password: Admin123!
('manager1', 'manager1@municipal.go.ke', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYKCX8F1tO', 'John Manager', 2), -- password: Admin123!
('operator1', 'operator1@municipal.go.ke', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYKCX8F1tO', 'Jane Operator', 3), -- password: Admin123!
('viewer1', 'viewer1@municipal.go.ke', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYKCX8F1tO', 'Bob Viewer', 4); -- password: Admin123!

-- Insert sample collection events (last 30 days)
INSERT INTO collection_events (collection_point_id, waste_type_id, collection_date, volume_cubic_meters, weight_tons, crew_members, notes, created_by) VALUES
(1, 1, CURRENT_DATE - INTERVAL '1 day', 15.5, 2.3, '["John Doe", "Jane Smith", "Bob Wilson"]', 'Regular collection from CBD restaurants', 3),
(1, 2, CURRENT_DATE - INTERVAL '1 day', 8.2, 1.1, '["John Doe", "Jane Smith"]', 'Organic waste from hotels', 3),
(2, 1, CURRENT_DATE - INTERVAL '2 days', 22.1, 3.2, '["Mike Johnson", "Sarah Davis"]', 'Westlands commercial waste', 3),
(2, 3, CURRENT_DATE - INTERVAL '2 days', 5.8, 0.8, '["Mike Johnson"]', 'Plastic recycling', 3),
(3, 1, CURRENT_DATE - INTERVAL '3 days', 18.7, 2.7, '["David Brown", "Lisa Garcia"]', 'Eastlands residential collection', 3),
(4, 1, CURRENT_DATE - INTERVAL '4 days', 12.3, 1.8, '["Tom Anderson", "Emma White"]', 'South B collection', 3),
(5, 1, CURRENT_DATE - INTERVAL '5 days', 25.4, 3.6, '["Chris Taylor", "Rachel Green"]', 'Karen high-volume collection', 3),
(5, 4, CURRENT_DATE - INTERVAL '5 days', 7.9, 1.2, '["Chris Taylor"]', 'Paper recycling', 3),
(6, 1, CURRENT_DATE - INTERVAL '6 days', 31.2, 4.5, '["Kevin Miller", "Amanda Clark", "Brian Lewis"]', 'River Road industrial waste', 3),
(6, 6, CURRENT_DATE - INTERVAL '6 days', 4.1, 0.9, '["Kevin Miller"]', 'Metal scrap collection', 3),
(7, 1, CURRENT_DATE - INTERVAL '7 days', 16.8, 2.4, '["Steven Wright", "Olivia Martinez"]', 'Lavington residential', 3),
(8, 1, CURRENT_DATE - INTERVAL '8 days', 19.3, 2.8, '["Daniel Lee", "Sophia Rodriguez"]', 'Kilimani mixed collection', 3),
(9, 1, CURRENT_DATE - INTERVAL '9 days', 14.7, 2.1, '["Anthony Hill", "Isabella Lopez"]', 'Parklands collection', 3),
(10, 1, CURRENT_DATE - INTERVAL '10 days', 9.4, 1.4, '["Matthew Scott", "Mia Young"]', 'Westlands Mall commercial waste', 3),
(1, 1, CURRENT_DATE - INTERVAL '11 days', 17.2, 2.5, '["John Doe", "Jane Smith", "Bob Wilson"]', 'CBD weekend collection', 3),
(2, 1, CURRENT_DATE - INTERVAL '12 days', 20.8, 3.0, '["Mike Johnson", "Sarah Davis"]', 'Westlands office waste', 3),
(3, 2, CURRENT_DATE - INTERVAL '13 days', 11.5, 1.5, '["David Brown", "Lisa Garcia"]', 'Eastlands organic waste', 3),
(4, 1, CURRENT_DATE - INTERVAL '14 days', 13.9, 2.0, '["Tom Anderson", "Emma White"]', 'South B collection', 3),
(5, 1, CURRENT_DATE - INTERVAL '15 days', 23.7, 3.4, '["Chris Taylor", "Rachel Green"]', 'Karen collection', 3),
(6, 7, CURRENT_DATE - INTERVAL '16 days', 2.3, 0.3, '["Kevin Miller"]', 'Electronic waste collection', 3),
(7, 1, CURRENT_DATE - INTERVAL '17 days', 15.1, 2.2, '["Steven Wright", "Olivia Martinez"]', 'Lavington residential', 3),
(8, 5, CURRENT_DATE - INTERVAL '18 days', 3.7, 0.8, '["Daniel Lee"]', 'Glass recycling', 3),
(9, 1, CURRENT_DATE - INTERVAL '19 days', 16.4, 2.4, '["Anthony Hill", "Isabella Lopez"]', 'Parklands collection', 3),
(10, 3, CURRENT_DATE - INTERVAL '20 days', 6.2, 0.9, '["Matthew Scott"]', 'Mall plastic waste', 3),
(1, 1, CURRENT_DATE - INTERVAL '21 days', 18.9, 2.7, '["John Doe", "Jane Smith", "Bob Wilson"]', 'CBD collection', 3),
(2, 1, CURRENT_DATE - INTERVAL '22 days', 21.3, 3.1, '["Mike Johnson", "Sarah Davis"]', 'Westlands collection', 3),
(3, 1, CURRENT_DATE - INTERVAL '23 days', 19.8, 2.9, '["David Brown", "Lisa Garcia"]', 'Eastlands collection', 3),
(4, 1, CURRENT_DATE - INTERVAL '24 days', 14.2, 2.1, '["Tom Anderson", "Emma White"]', 'South B collection', 3),
(5, 1, CURRENT_DATE - INTERVAL '25 days', 24.6, 3.5, '["Chris Taylor", "Rachel Green"]', 'Karen collection', 3),
(6, 1, CURRENT_DATE - INTERVAL '26 days', 28.9, 4.2, '["Kevin Miller", "Amanda Clark"]', 'River Road collection', 3),
(7, 1, CURRENT_DATE - INTERVAL '27 days', 17.3, 2.5, '["Steven Wright", "Olivia Martinez"]', 'Lavington collection', 3),
(8, 1, CURRENT_DATE - INTERVAL '28 days', 20.1, 2.9, '["Daniel Lee", "Sophia Rodriguez"]', 'Kilimani collection', 3),
(9, 1, CURRENT_DATE - INTERVAL '29 days', 15.8, 2.3, '["Anthony Hill", "Isabella Lopez"]', 'Parklands collection', 3),
(10, 1, CURRENT_DATE - INTERVAL '30 days', 10.7, 1.6, '["Matthew Scott", "Mia Young"]', 'Mall collection', 3);