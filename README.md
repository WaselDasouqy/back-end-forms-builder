# FormWave Backend API

A robust Express.js backend server for the FormWave form builder application, built with TypeScript and Supabase.

## 🚀 Features

- **RESTful API** for form management and responses
- **Supabase integration** for database operations and authentication
- **TypeScript** for type safety and better development experience
- **Security** with helmet, CORS, and rate limiting
- **Input validation** with express-validator
- **Comprehensive logging** with Morgan and Winston
- **Production-ready** with proper error handling and monitoring

## 📋 Prerequisites

- Node.js (>= 18.0.0)
- npm (>= 8.0.0)
- Supabase account and project

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/WaselDasouqy/back-end-forms-builder.git
   cd back-end-forms-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Fill in the required environment variables in `.env`:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   
   # CORS Configuration
   CLIENT_URL=http://localhost:3000
   
   # JWT Configuration (optional)
   JWT_SECRET=your_jwt_secret_key
   
   # Rate Limiting (optional)
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## 🏗️ Building for Production

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   └── supabase.ts  # Supabase client configuration
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Application entry point
├── dist/                # Compiled JavaScript (generated)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── render.yaml          # Render deployment configuration
├── env.example          # Environment variables template
└── README.md            # This file
```

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Server health check

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Forms
- `GET /api/forms` - Get user's forms
- `GET /api/forms/:id` - Get specific form
- `POST /api/forms` - Create new form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### Responses
- `GET /api/forms/:id/responses` - Get form responses
- `POST /api/forms/:id/responses` - Submit form response
- `GET /api/responses/:id` - Get specific response
- `DELETE /api/responses/:id` - Delete response

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `SUPABASE_URL` | Supabase project URL | Yes | - |
| `SUPABASE_KEY` | Supabase anonymous key | Yes | - |
| `CLIENT_URL` | Frontend application URL | Yes | http://localhost:3000 |
| `JWT_SECRET` | JWT signing secret | No | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window in ms | No | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | 100 |

## 🚀 Deployment

### Deploy to Render

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready backend"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the backend repository

3. **Configure Render Service**
   - **Name**: `formwave-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or as needed)

4. **Set Environment Variables**
   Add the following environment variables in Render:
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy on every push to main branch

### Manual Deployment

For other platforms, you can:

1. Build the application:
   ```bash
   npm run build:prod
   ```

2. Start the production server:
   ```bash
   NODE_ENV=production npm start
   ```

## 🔧 Development Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm run build:clean` - Clean build directory and rebuild
- `npm run build:prod` - Production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run typecheck` - Type check without emitting

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change PORT in .env or kill existing process
   lsof -ti:5000 | xargs kill -9
   ```

2. **Supabase connection errors**
   - Verify SUPABASE_URL and SUPABASE_KEY in environment variables
   - Check Supabase project settings and API keys

3. **CORS errors**
   - Ensure CLIENT_URL matches your frontend URL exactly
   - Check that frontend domain is added to allowed origins

4. **Build errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Logs

View application logs:
```bash
# Development
npm run dev

# Production (check your hosting platform's logs)
# For Render: Dashboard → Service → Logs
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Create a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review the [API documentation](#-api-endpoints)
3. Check environment variables configuration
4. Verify Supabase connection and permissions

For additional support, please open an issue in the GitHub repository.