# FormWave Server

Backend API for the FormWave form builder application. This server provides a RESTful API for managing forms, form submissions, and user authentication.

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Supabase** - Backend-as-a-Service for database and authentication
- **PostgreSQL** - Relational database (via Supabase)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- NPM or Yarn

### Installation

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on the example:
   ```
   NODE_ENV=development
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   CLIENT_URL=http://localhost:3000
   LOG_LEVEL=debug
   ```

### Development

To start the development server with hot reloading:

```
npm run dev
```

### Production Build

To create a production build:

```
npm run build
```

To start the production server:

```
npm start
```

## API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Login a user |
| `/api/auth/logout` | POST | Logout the current user |
| `/api/auth/me` | GET | Get the current user's profile |
| `/api/auth/reset-password/request` | POST | Request a password reset |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/auth/profile` | PUT | Update user profile |

### Forms

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/forms` | GET | Get all forms for the authenticated user |
| `/api/forms/:id` | GET | Get a specific form by ID |
| `/api/forms` | POST | Create a new form |
| `/api/forms/:id` | PUT | Update a form |
| `/api/forms/:id` | DELETE | Delete a form |

### Responses

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/forms/:formId/responses` | POST | Submit a response to a form |
| `/api/forms/:formId/responses` | GET | Get all responses for a form |
| `/api/responses/:id` | GET | Get a specific response by ID |
| `/api/responses/:id` | DELETE | Delete a response |

## Database Schema

The application uses the following tables in Supabase:

- `forms` - Stores form metadata
- `form_fields` - Stores fields for each form
- `field_options` - Stores options for select/checkbox/radio fields
- `form_responses` - Stores form submission metadata
- `response_values` - Stores individual field values for each response
- `form_themes` - Stores user-created themes

## Security

- Authentication is handled via Supabase Auth
- Row Level Security (RLS) policies are implemented for all tables
- API endpoints are protected with JWT authentication
- CORS is configured to only allow requests from the frontend 