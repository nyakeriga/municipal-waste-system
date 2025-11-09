# Municipal Waste Management System - Setup Guide

## System Overview

This is a comprehensive web-based system for managing municipal waste collection points and subscribers. The system helps municipal staff register and monitor waste collection points, manage business subscribers, and track waste collection activities.

### Key Features

- Collection Point Registry with spatial data support
- Subscriber Management System
- Interactive City Map with GIS layers
- Waste Collection Data Tracking
- Comprehensive Reporting Dashboard
- Role-Based Access Control
- Complete Audit Trail

## Prerequisites

1. Docker and Docker Compose
2. Node.js v20 or later (for development)
3. PostgreSQL 15 with PostGIS extension
4. Modern web browser

## Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd municipal-waste-system
   ```

2. Create a `.env` file in the root directory:
   ```
   POSTGRES_DB=municipal_waste
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_password
   JWT_SECRET=your_jwt_secret_key
   ```

3. Generate SSL certificates for HTTPS:
   ```bash
   mkdir -p deployments/nginx/ssl
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout deployments/nginx/ssl/nginx.key \
     -out deployments/nginx/ssl/nginx.crt
   ```

4. Start the application:
   ```bash
   docker-compose up -d
   ```

5. Access the application:
   - Web Interface: https://localhost
   - API Documentation: https://localhost/api-docs

## Development Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a development configuration:
   ```bash
   cp src/config/default.json src/config/development.json
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Initial Configuration

### 1. Database Setup

The database schema and initial data will be automatically created when running with Docker. For manual setup:

1. Create the database:
   ```bash
   createdb municipal_waste
   ```

2. Enable PostGIS:
   ```bash
   psql municipal_waste -c "CREATE EXTENSION postgis;"
   ```

3. Run the initialization scripts:
   ```bash
   psql municipal_waste -f db/init/01_schema.sql
   psql municipal_waste -f db/init/02_indexes.sql
   ```

### 2. Create Admin User

1. Access the application at https://localhost
2. Click "Register" and create an admin account
3. Use the following SQL to grant admin privileges:
   ```sql
   UPDATE users SET role_id = 1 WHERE username = 'admin';
   ```

## System Architecture

### Backend

- Node.js with Express
- PostgreSQL with PostGIS for spatial data
- JWT-based authentication
- Role-based access control

### Frontend

- Vue.js 3 with Composition API
- Leaflet for interactive maps
- Vuex for state management
- Vue Router for navigation

### Infrastructure

- NGINX as reverse proxy
- Docker for containerization
- PostGIS for spatial database capabilities

## Security Features

1. Role-Based Access Control (RBAC)
2. JWT Authentication
3. SSL/TLS Encryption
4. SQL Injection Prevention
5. XSS Protection
6. CSRF Protection
7. Complete Audit Logging

## Maintenance

### Backup Database

```bash
docker-compose exec db pg_dump -U postgres municipal_waste > backup.sql
```

### Restore Database

```bash
docker-compose exec -T db psql -U postgres municipal_waste < backup.sql
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

## Troubleshooting

### Common Issues

1. Database Connection Issues
   - Check PostgreSQL service is running
   - Verify database credentials in config
   - Ensure PostGIS extension is enabled

2. Map Not Loading
   - Check internet connection (for tile layers)
   - Verify API key configuration
   - Clear browser cache

3. Permission Denied
   - Verify user role assignments
   - Check RBAC configuration
   - Review audit logs

### Support

For technical support:
1. Check the documentation in the `/docs` directory
2. Review issue tracker on the repository
3. Contact system administrator

## License

[Your License Information]
