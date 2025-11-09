# Municipal Waste Management System

A comprehensive web-based system for managing municipal waste collection points and subscribers in urban areas. Built with modern technologies to provide efficient waste management operations with GIS mapping capabilities.

## 🚀 Features

### Core Functionality
- **Collection Point Registry**: Create, edit, and manage waste collection points with GPS coordinates
- **Subscriber Management**: Link businesses and establishments to collection points
- **Interactive GIS Map**: Visual representation of collection points and subscribers
- **Waste Collection Tracking**: Record collection events with volume, weight, and crew details
- **Comprehensive Reporting**: Generate detailed reports with CSV export capabilities
- **Role-Based Access Control**: Secure authentication with different permission levels
- **Complete Audit Trail**: Track all system changes and user activities

### Technical Features
- **Modern Tech Stack**: Node.js, Vue.js, PostgreSQL with PostGIS
- **Real-time Mapping**: Leaflet-based interactive maps
- **RESTful API**: Well-documented API endpoints
- **Security First**: JWT authentication, rate limiting, input validation
- **Scalable Architecture**: Docker containerization, microservices-ready
- **Data Export**: CSV and JSON export capabilities

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js with middleware architecture
- **Database**: PostgreSQL with PostGIS for spatial data
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Input sanitization and business rule validation
- **Security**: Helmet, CORS, rate limiting, audit logging

### Frontend (Vue.js)
- **Framework**: Vue 3 with Composition API
- **State Management**: Pinia for reactive data management
- **Routing**: Vue Router with protected routes
- **Mapping**: Vue-Leaflet for interactive GIS maps
- **UI Components**: Bootstrap 5 with custom styling

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Reverse Proxy**: Nginx for load balancing and SSL
- **Database**: PostGIS for advanced spatial queries
- **Deployment**: Docker Compose for easy orchestration

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js v20+ (for development)
- PostgreSQL 15+ with PostGIS extension
- Modern web browser with JavaScript enabled

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd municipal-waste-system
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Generate SSL certificates (for production)**
   ```bash
   mkdir -p deployments/nginx/ssl
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout deployments/nginx/ssl/nginx.key \
     -out deployments/nginx/ssl/nginx.crt
   ```

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - Web Interface: https://localhost
   - API Documentation: https://localhost/api/docs
   - Health Check: https://localhost/health

### Development Setup

#### Backend Setup
```bash
cd backend
npm install
cp src/config/default.json src/config/development.json
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Default Credentials

- **Username**: admin
- **Password**: Admin123!

⚠️ **Important**: Change the default password immediately after first login!

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/change-password` - Password change

### Collection Points
- `GET /api/collection-points` - List all points
- `POST /api/collection-points` - Create new point
- `PUT /api/collection-points/:id` - Update point
- `DELETE /api/collection-points/:id` - Deactivate point

### Subscribers
- `GET /api/subscribers` - List all subscribers
- `POST /api/subscribers` - Create new subscriber
- `PUT /api/subscribers/:id` - Update subscriber
- `DELETE /api/subscribers/:id` - Deactivate subscriber

### Collection Events
- `GET /api/collection-events` - List collection events
- `POST /api/collection-events` - Record new collection
- `PUT /api/collection-events/:id` - Update collection event
- `DELETE /api/collection-events/:id` - Delete collection event

### Reports
- `GET /api/reports/waste-collection-summary` - Collection summary report
- `GET /api/reports/subscriber-activity` - Subscriber activity report
- `GET /api/reports/collection-point-performance` - Performance report
- `GET /api/reports/audit` - Audit log report

## 🗄️ Database Schema

### Core Tables
- `roles` - User roles and permissions
- `users` - System users
- `waste_types` - Types of waste collected
- `collection_points` - Waste collection locations
- `subscribers` - Business subscribers
- `collection_events` - Waste collection records
- `audit_logs` - System activity logs

### Spatial Features
- PostGIS geometry columns for GPS coordinates
- Spatial indexes for efficient queries
- Distance calculations and proximity searches
- Bounding box queries for map interactions

## 🔒 Security Features

- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers
- **Audit Logging**: Complete activity tracking
- **Password Security**: bcrypt hashing with salt rounds

## 📈 Performance Optimizations

- **Database Indexing**: Optimized indexes for spatial and regular queries
- **Connection Pooling**: Efficient database connection management
- **Caching**: Response caching for frequently accessed data
- **Compression**: Gzip compression for API responses
- **Lazy Loading**: On-demand data loading in frontend
- **Code Splitting**: Optimized bundle sizes

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📚 Documentation

- [Setup Guide](docs/setup-guide.md)
- [API Documentation](docs/api-spec.md)
- [Security Guide](docs/audit-and-security.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Open an issue on GitHub
- Contact the development team

## 🗺️ Roadmap

- [ ] PDF report generation
- [ ] Mobile application
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API rate limiting per user
- [ ] Automated backup system
- [ ] Integration with IoT sensors

---

**Built with ❤️ for efficient municipal waste management**