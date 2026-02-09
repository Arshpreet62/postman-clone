# 🚀 Deployment Checklist

## Pre-Deployment

### Backend

- [ ] Update `.env` with production values
- [ ] Set `NODE_ENV=production`
- [ ] Generate secure JWT_SECRET (32+ characters)
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Update FRONTEND_URL in .env
- [ ] Test build: `npm run build`
- [ ] Verify health endpoint works: `GET /health`

### Frontend

- [ ] Update `.env` with production API_URL
- [ ] Test build: `npm run build`
- [ ] Verify no console errors in build
- [ ] Check bundle size (should be < 1MB)

## Render Deployment (Backend)

1. **Create Web Service**
   - [ ] Connect GitHub repository
   - [ ] Set root directory to `backend`
   - [ ] Build command: `npm install && npm run build`
   - [ ] Start command: `npm start`
   - [ ] Select Node version: 18 or higher

2. **Environment Variables**
   - [ ] NODE_ENV=production
   - [ ] PORT=5000
   - [ ] MONGO_URI=<your_mongodb_uri>
   - [ ] JWT_SECRET=<32+\_char_secret>
   - [ ] FRONTEND_URL=<your_vercel_url>

3. **Health Check**
   - [ ] Path: `/health`
   - [ ] Verify returns 200 OK

4. **Verification**
   - [ ] Test `/health` endpoint
   - [ ] Test `/api/auth/signup` with Postman
   - [ ] Check logs for errors
   - [ ] Verify MongoDB connection

## Vercel Deployment (Frontend)

1. **Environment Variables**
   - [ ] VITE_API_URL=<your_render_backend_url>

2. **Build Settings**
   - [ ] Framework preset: Vite
   - [ ] Build command: `npm run build`
   - [ ] Output directory: `dist`
   - [ ] Install command: `npm install`
   - [ ] Root directory: `client`

3. **Verification**
   - [ ] Homepage loads
   - [ ] Can signup/login
   - [ ] Can make API requests
   - [ ] History saves correctly
   - [ ] Toast notifications work

## Post-Deployment

### Security

- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] JWT tokens working

### Performance

- [ ] API response time < 500ms
- [ ] Frontend loads < 3 seconds
- [ ] MongoDB queries optimized (indexed)

### Monitoring

- [ ] Check Render logs
- [ ] Monitor error rates
- [ ] Test from different locations
- [ ] Mobile responsiveness

## Common Issues

### "Health check failed"

- Verify `/health` endpoint returns 200
- Check PORT is set to 5000
- Review Render logs

### "CORS error"

- Ensure FRONTEND_URL matches Vercel URL
- Check CORS configuration includes credentials
- Verify URL has no trailing slash

### "MongoDB connection timeout"

- IP whitelist includes `0.0.0.0/0` or Render IPs
- Connection string is correct
- Network access configured in MongoDB Atlas

### "JWT token invalid"

- JWT_SECRET matches between deployments
- Token not expired (7 days)
- Authorization header format: `Bearer <token>`

## Rollback Plan

If deployment fails:

1. Revert to previous Git commit
2. Redeploy previous version
3. Check environment variables
4. Review error logs

## Success Criteria

✅ Backend health check returns 200
✅ Frontend loads without errors
✅ User can signup and login
✅ API requests work end-to-end
✅ Request history saves and displays
✅ Statistics page shows data
✅ No console errors
✅ Mobile responsive
✅ All features work as expected

---

**Date Deployed**: ****\_\_****
**Backend URL**: ****\_\_****
**Frontend URL**: ****\_\_****
**Deployed By**: ****\_\_****
