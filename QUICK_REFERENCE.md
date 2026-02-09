# 🚀 Quick Reference Guide

## Environment Setup

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend.onrender.com
```

## Common Commands

### Backend

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Type check
npm run typecheck
```

### Frontend

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## API Endpoints Quick Reference

### Public

```
GET  /              # API info
GET  /health        # Health check
POST /api/auth/signup
POST /api/auth/login
```

### Protected (Requires Authorization: Bearer <token>)

```
GET    /api/auth/profile
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/request
GET    /api/history?page=1&limit=10
GET    /api/history/:id
DELETE /api/history/:id
DELETE /api/history
GET    /api/stats
```

## Testing with cURL

### Signup

```bash
curl -X POST https://your-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Make API Request

```bash
curl -X POST https://your-backend.onrender.com/api/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://jsonplaceholder.typicode.com/posts/1",
    "method": "GET",
    "headers": []
  }'
```

### Get History

```bash
curl https://your-backend.onrender.com/api/history?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Debugging

### Check Logs

```bash
# In Render dashboard
# Go to Logs tab
# Look for errors in red

# Key things to check:
# ✓ MongoDB Connected
# ✓ Server running on port 5000
# ✓ No validation errors
```

### Common Errors

**"Invalid environment variables"**

```bash
# Check .env file has all required vars
# JWT_SECRET must be 32+ characters
```

**"MongoDB connection timeout"**

```bash
# Check MONGO_URI is correct
# Whitelist IP in MongoDB Atlas (use 0.0.0.0/0 for Render)
```

**"CORS error"**

```bash
# Ensure FRONTEND_URL matches your Vercel URL exactly
# No trailing slash
```

**"No token provided"**

```bash
# Check Authorization header format:
# Authorization: Bearer <token>
```

## Key Files to Understand

### Backend

- `src/index.ts` - Server entry, middleware setup
- `src/config/env.ts` - Environment validation
- `src/middleware/errorHandler.ts` - Error handling
- `src/routes/requestRoutes.ts` - API request routes
- `src/authroutes.ts` - Authentication routes

### Frontend

- `src/services/api.ts` - API calls
- `src/components/UI/Toast.tsx` - Notifications
- `src/components/Layout/context/ContextProvider.tsx` - Global state
- `src/config/config.ts` - Configuration

## Production Checklist

### Before Deploy

- [ ] .env configured
- [ ] JWT_SECRET is 32+ characters
- [ ] MongoDB IP whitelist updated
- [ ] FRONTEND_URL is correct
- [ ] `npm run build` succeeds

### After Deploy

- [ ] Health check returns 200
- [ ] Can signup/login
- [ ] API requests work
- [ ] History saves
- [ ] No errors in logs

## Performance Tips

### Backend

- Database indexes on `user` and `timestamp` in RequestHistory
- Rate limiting protects against abuse
- Compression reduces response size by 70-90%
- Request timeout prevents hanging connections

### Frontend

- API service handles timeouts (30s)
- Loading states prevent duplicate requests
- Toast auto-dismisses (5s)
- Lazy load components (future improvement)

## Security Reminders

1. **Never commit .env files**
2. **Use strong JWT_SECRET** (32+ chars, random)
3. **Whitelist specific IPs** in MongoDB (production)
4. **Enable HTTPS only** (automatic on Vercel/Render)
5. **Rotate JWT_SECRET** periodically (every 90 days)
6. **Monitor rate limit hits** (indicates attack)

## Useful Resources

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **JWT Debugger**: https://jwt.io
- **API Testing**: Use Postman or Insomnia

## Support

If something breaks:

1. Check logs in Render/Vercel dashboard
2. Verify environment variables
3. Test endpoints with cURL
4. Check MongoDB connection
5. Review REFACTOR_SUMMARY.md for common issues

---

**Keep this file handy during development and deployment!**
