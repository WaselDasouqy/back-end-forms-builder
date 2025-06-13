# FormWave Backend Deployment Guide

## Koyeb Deployment

### Prerequisites
- GitHub account with the backend repository
- Koyeb account (free tier available)
- Supabase project with credentials

### Environment Variables Required

Set these environment variables in your Koyeb service:

```env
NODE_ENV=production
PORT=8000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
CLIENT_URL=https://your-frontend-domain.vercel.app
JWT_SECRET=your_jwt_secret_key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Manual Deployment Steps

1. **Login to Koyeb**
   - Go to [Koyeb Dashboard](https://app.koyeb.com/)
   - Sign in with your account

2. **Create New Service**
   - Click "Create Service"
   - Choose "GitHub" as source
   - Connect your GitHub account if not already connected
   - Select the backend repository: `back-end-forms-builder`

3. **Configure Service**
   - **Name**: `formwave-backend`
   - **Region**: Choose closest to your users (e.g., `fra` for Europe)
   - **Instance Type**: `nano` (free tier)
   - **Build Command**: `npm ci && npm run build`
   - **Run Command**: `npm start`
   - **Port**: `8000`
   - **Health Check Path**: `/api/health`

4. **Set Environment Variables**
   In the Environment Variables section, add all the variables listed above.

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your API will be available at: `https://your-service-name.koyeb.app`

### CI/CD Setup

The repository includes GitHub Actions workflow that will:
- Run tests on every push
- Build the application
- Automatically trigger Koyeb deployment

To enable automatic deployment:
1. Go to your Koyeb service settings
2. Enable "Auto-deploy" from GitHub
3. Set branch to `main`

### Updating the Deployment

#### Method 1: Git Push (Recommended)
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Koyeb will automatically detect changes and redeploy.

#### Method 2: Manual Redeploy
1. Go to Koyeb Dashboard
2. Select your service
3. Click "Redeploy"

### Monitoring and Logs

1. **View Logs**
   - Go to Koyeb Dashboard
   - Select your service
   - Click on "Logs" tab

2. **Health Check**
   - Visit: `https://your-service-name.koyeb.app/api/health`
   - Should return: `{"status":"ok","message":"API is running"}`

3. **Service Status**
   - Monitor in Koyeb Dashboard
   - Check metrics and performance

### Troubleshooting

#### Common Issues

1. **Service Won't Start**
   - Check environment variables are set correctly
   - Verify Supabase credentials
   - Check logs for specific errors

2. **CORS Errors**
   - Ensure `CLIENT_URL` matches your frontend domain exactly
   - Check that frontend domain is in allowed origins

3. **Database Connection Issues**
   - Verify `SUPABASE_URL` and `SUPABASE_KEY`
   - Check Supabase project is active
   - Ensure RLS policies are configured

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check for TypeScript errors

#### Debug Commands

```bash
# Check service status
curl https://your-service-name.koyeb.app/api/health

# Test specific endpoints
curl https://your-service-name.koyeb.app/api/forms

# Check CORS
curl -H "Origin: https://your-frontend-domain.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-service-name.koyeb.app/api/health
```

### Performance Optimization

1. **Instance Scaling**
   - Start with `nano` instance
   - Monitor performance in Koyeb dashboard
   - Upgrade to `micro` or `small` if needed

2. **Database Optimization**
   - Use connection pooling
   - Optimize Supabase queries
   - Add database indexes for frequently queried fields

3. **Caching**
   - Implement Redis for session storage (if needed)
   - Use HTTP caching headers
   - Cache frequently accessed data

### Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong JWT secrets
   - Rotate API keys regularly

2. **CORS Configuration**
   - Only allow necessary origins
   - Use specific domains, avoid wildcards in production

3. **Rate Limiting**
   - Adjust limits based on usage patterns
   - Monitor for abuse

4. **Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Regular security audits 