# SportApp - Fitness & Social Training Platform

A comprehensive React Native mobile application with Node.js backend for fitness tracking, social features, and AI-powered workout recommendations.

## 🏗️ Architecture

- **Frontend**: React Native with TypeScript
- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL with Redis caching
- **Authentication**: JWT with refresh tokens
- **Real-time**: WebSocket support for live features
- **Deployment**: Docker containerization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- React Native development environment
- Docker (optional, for containerized deployment)

### Backend Setup

1. **Clone and install dependencies:**

   ```bash
   cd server
   npm install
   ```

2. **Environment Configuration:**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:

   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sportapp
   DB_USER=sportapp_user
   DB_PASSWORD=your_secure_password

   # JWT Secrets (generate with: openssl rand -base64 32)
   JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters
   JWT_REFRESH_SECRET=your_refresh_secret_key

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password

   # Server
   NODE_ENV=development
   PORT=3500
   CORS_ORIGINS=http://localhost:8081,http://10.0.2.2:8081
   ```

3. **Database Setup:**

   ```bash
   # Create database and user
   createdb sportapp
   createuser sportapp_user
   psql -d sportapp -c "ALTER USER sportapp_user WITH PASSWORD 'your_secure_password';"
   psql -d sportapp -c "GRANT ALL PRIVILEGES ON DATABASE sportapp TO sportapp_user;"
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

### Mobile App Setup

1. **Install dependencies:**

   ```bash
   cd SportApp
   npm install
   ```

2. **Environment Configuration:**

   ```bash
   cp .env.example .env
   ```

   Update with your backend URL:

   ```env
   API_BASE_URL=http://localhost:3500/api
   ```

3. **Start the app:**

   ```bash
   # iOS
   npx react-native run-ios

   # Android
   npx react-native run-android
   ```

## 📱 Features

### Core Functionality

- **User Authentication**: Secure login/register with JWT
- **Workout Tracking**: Log exercises, sets, and reps
- **Exercise Library**: 50+ predefined exercises with instructions
- **Training Programs**: Structured workout programs
- **Progress Tracking**: Photos, measurements, and analytics
- **Social Features**: Friend system, workout sharing, likes
- **AI Recommendations**: Personalized workout suggestions
- **Wearable Integration**: Heart rate and sleep data sync
- **Offline Support**: Work offline, sync when connected

### Technical Features

- **Real-time Sync**: Conflict resolution for offline data
- **Push Notifications**: Workout reminders and social updates
- **Image Upload**: Progress photos and profile pictures
- **Data Export**: Export workout history and progress
- **Performance Analytics**: Detailed workout statistics
- **Nutrition Tracking**: Food logging and meal planning

## 🔧 Development

### Project Structure

```
sport-app/
├── server/                 # Backend API
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Configuration files
│   │   └── database.ts    # Database setup
│   └── package.json
├── SportApp/              # React Native app
│   ├── src/
│   │   ├── screens/       # App screens
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   └── utils/         # Utility functions
│   └── package.json
└── docs/                  # Documentation
```

### API Endpoints

#### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/profile` - Get user profile

#### Workouts

- `GET /api/exercises` - List exercises
- `POST /api/trainings` - Create workout
- `GET /api/trainings` - Get workout history
- `PUT /api/trainings/:id` - Update workout

#### Social

- `GET /api/social/profile` - Get user profile
- `POST /api/social/friends/request` - Send friend request
- `GET /api/social/feed` - Get social feed
- `POST /api/social/workouts/share` - Share workout

#### AI & Recommendations

- `GET /api/ai/recommendations` - Get AI recommendations
- `POST /api/ai/recommendations/apply` - Apply recommendation
- `POST /api/ai/recommendations/rate` - Rate recommendation

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individually
docker build -t sportapp-server ./server
docker build -t sportapp-mobile ./SportApp
```

### Production Checklist

1. **Security**: Update all secrets and passwords
2. **Environment**: Set `NODE_ENV=production`
3. **Database**: Configure production PostgreSQL
4. **Redis**: Set up production Redis instance
5. **SSL**: Configure HTTPS certificates
6. **Monitoring**: Set up logging and monitoring
7. **Backup**: Configure database backups

## 🔒 Security

### Best Practices Implemented

- **JWT Security**: Secure token generation and validation
- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Validation**: Request validation middleware
- **Rate Limiting**: API rate limiting protection
- **CORS**: Cross-origin resource sharing protection
- **Helmet**: Security headers middleware
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Input sanitization

### Environment Variables

All sensitive configuration is stored in environment variables:

- Database credentials
- JWT secrets
- API keys
- Redis configuration
- CORS origins

## 📊 Testing

### Backend Tests

```bash
cd server
npm test
```

### Mobile App Tests

```bash
cd SportApp
npm test
```

### API Testing

```bash
# Test authentication
curl -X POST http://localhost:3500/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","nom":"Test User"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits for version control

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the API documentation

## 🔄 Version History

- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added social features and AI recommendations
- **v1.2.0**: Wearable integration and offline sync
- **v1.3.0**: Performance improvements and bug fixes

---

Built with ❤️ for the fitness community
