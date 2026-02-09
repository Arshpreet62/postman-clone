# 🚀 Postman Clone - Production-Grade API Testing Tool

A modern, full-stack API testing application built with React, TypeScript, Node.js, Express, and MongoDB. Features include request history, statistics, and user authentication.

## ✨ Features

### Core Functionality

- 🔥 **API Request Testing** - Support for GET, POST, PUT, DELETE, PATCH methods
- 📊 **Request History** - Track all your API requests with pagination
- 📈 **Statistics Dashboard** - Visualize success rates and request patterns
- 🔐 **User Authentication** - Secure JWT-based authentication
- ⚡ **Real-time Feedback** - Toast notifications for all actions
- 🎯 **Custom Headers** - Add and manage request headers dynamically
- 📝 **JSON Body Support** - Send JSON payloads with requests

### Production Features

- 🛡️ **Security**
  - Helmet.js for HTTP headers
  - Rate limiting (100 requests per 15 minutes)
  - CORS configuration
  - Input validation with Zod
  - Bcrypt password hashing (salt rounds: 12)

- ⚙️ **Performance**
  - Response compression
  - Request timeout handling (30s)
  - Database connection pooling
  - Efficient pagination

- 🔍 **Observability**
  - Winston logger with timestamps
  - Request/response logging
  - Error tracking
  - Health check endpoint

- 🚀 **Deployment Ready**
  - Environment validation
  - Graceful shutdown
  - Zero-downtime deployments
  - Docker support (optional)

## 🏗️ Architecture

### Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts          # Environment validation
│   │   └── logger.ts       # Winston logger setup
│   ├── middleware/
│   │   ├── errorHandler.ts # Centralized error handling
│   │   └── validation.ts   # Zod schemas
│   ├── routes/
│   │   └── requestRoutes.ts # API request routes
│   ├── authMiddleware.ts   # JWT authentication
│   ├── authroutes.ts       # Auth endpoints
│   ├── index.ts            # Server entry point
│   ├── requestHistory.ts   # MongoDB model
│   └── user.ts             # User model
├── .env.example
├── package.json
└── tsconfig.json
```

### Frontend Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── context/    # Global state management
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   └── UI/
│   │       ├── Form.tsx
│   │       ├── RequestHistory.tsx
│   │       ├── ResponseDisplay.tsx
│   │       ├── Statics.tsx
│   │       └── Toast.tsx   # Notification system
│   ├── config/
│   │   └── config.ts       # Environment config
│   ├── services/
│   │   └── api.ts          # API service layer
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or cloud)
- npm >= 9.0.0

### Backend Setup

1. **Clone and install dependencies**

```bash
cd backend
npm install
```

2. **Environment Configuration**

```bash
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long
FRONTEND_URL=https://your-frontend-url.com
```

⚠️ **IMPORTANT**: `JWT_SECRET` must be at least 32 characters for production!

3. **Development**

```bash
npm run dev
```

4. **Production Build**

```bash
npm run build
npm start
```

### Frontend Setup

1. **Install dependencies**

```bash
cd client
npm install
```

2. **Environment Configuration**

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000
```

3. **Development**

```bash
npm run dev
```

4. **Production Build**

```bash
npm run build
npm run preview
```

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/signup    - Create new user
POST   /api/auth/login     - Login user
GET    /api/auth/profile   - Get user profile (protected)
POST   /api/auth/refresh   - Refresh JWT token (protected)
POST   /api/auth/logout    - Logout (protected)
```

### API Testing

```
POST   /api/request        - Make API request (optional auth)
```

### History & Stats

```
GET    /api/history        - Get request history (protected, paginated)
GET    /api/history/:id    - Get specific request (protected)
DELETE /api/history/:id    - Delete request (protected)
DELETE /api/history        - Clear all history (protected)
GET    /api/stats          - Get statistics (protected)
```

### Health

```
GET    /health             - Health check
GET    /                   - API info
```

## 🔒 Security Best Practices

### Backend

- ✅ Environment variable validation on startup
- ✅ Rate limiting to prevent DDoS
- ✅ Helmet.js security headers
- ✅ CORS with specific origins
- ✅ JWT expiration (7 days)
- ✅ Bcrypt with 12 salt rounds
- ✅ Input validation with Zod
- ✅ MongoDB injection prevention (Mongoose)
- ✅ Error messages don't leak sensitive info

### Frontend

- ✅ XSS protection (React escaping)
- ✅ Secure token storage (localStorage with HTTPOnly alternative recommended)
- ✅ HTTPS-only in production
- ✅ Request timeout handling
- ✅ Error boundaries (recommended to add)

## 🌐 Deployment

### Render (Backend)

1. **Create new Web Service**
   - Connect your GitHub repo
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

2. **Environment Variables**
   Add all variables from `.env.example`

3. **Important Settings**
   - Health check path: `/health`
   - Port: 5000 (or use `PORT` env var)
   - Auto-deploy: Enabled

### Vercel (Frontend)

1. **Deploy**

```bash
cd client
npm run build
vercel --prod
```

2. **Environment Variables**
   - `VITE_API_URL`: Your Render backend URL

3. **Build Settings**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

## 🛠️ Key Improvements Made

### Critical Fixes

1. ✅ **CORS Credentials** - Added `credentials: true` for authentication
2. ✅ **Health Check** - Added `/health` endpoint for deployment platforms
3. ✅ **Rate Limiting** - Protected against DDoS attacks
4. ✅ **Request Timeout** - 30-second timeout prevents hanging requests
5. ✅ **Environment Validation** - Validates all env vars on startup

### Architecture Improvements

1. ✅ **Error Middleware** - Centralized error handling
2. ✅ **API Service Layer** - Clean separation of concerns (frontend)
3. ✅ **Validation Layer** - Zod schemas for type-safe validation
4. ✅ **Logger** - Winston for production-grade logging
5. ✅ **Graceful Shutdown** - Proper cleanup on SIGTERM/SIGINT

### UX Improvements

1. ✅ **Toast Notifications** - Real-time feedback
2. ✅ **Loading States** - Visual feedback during operations
3. ✅ **Better Error Messages** - User-friendly error handling
4. ✅ **Form Validation** - Client-side validation
5. ✅ **Improved UI** - Better styling and animations

## 📚 What I Learned / New Concepts

### 1. **Environment Validation with Zod**

- Validates environment variables at startup
- Type-safe environment access
- Fails fast if configuration is wrong

### 2. **Async Error Handling Pattern**

```typescript
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

- Eliminates try-catch boilerplate
- Centralizes error handling

### 3. **Graceful Shutdown**

- Closes server gracefully on SIGTERM/SIGINT
- Closes database connections
- Prevents data loss
- Critical for zero-downtime deployments

### 4. **Rate Limiting Strategy**

- Prevents abuse and DDoS
- Per-IP tracking
- Configurable windows and limits

### 5. **API Service Pattern (Frontend)**

- Centralized API calls
- Automatic token injection
- Timeout handling
- Type-safe responses

### 6. **Toast Context Pattern**

- Global notification system
- Auto-dismiss after 5 seconds
- Multiple simultaneous toasts
- Type-safe toast types

## 🐛 Common Issues & Solutions

### Issue: "Invalid JWT_SECRET"

**Solution**: Ensure JWT_SECRET is at least 32 characters in `.env`

### Issue: CORS errors

**Solution**: Add your frontend URL to CORS origins in `backend/src/index.ts`

### Issue: MongoDB connection timeout

**Solution**:

- Check MONGO_URI format
- Whitelist IP in MongoDB Atlas
- Check network connectivity

### Issue: Render service won't start

**Solution**:

- Verify `/health` endpoint responds
- Check environment variables
- Review logs in Render dashboard

## 📈 Performance Metrics

- API Response Time: < 200ms (average)
- Request Timeout: 30 seconds
- Rate Limit: 100 requests / 15 minutes per IP
- JWT Expiration: 7 days
- Database Connection: Pooled with auto-reconnect

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use for learning or production!

## 👨‍💻 Author

**Arshpreet**

---

## 🎓 Learning Resources

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Security](https://jwt.io/introduction)
- [Zod Validation](https://zod.dev/)
- [Winston Logger](https://github.com/winstonjs/winston)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)

---

Made with ❤️ and lots of ☕
