# CMC Nursery Website

A full-stack nursery management platform built with React, Express, and PostgreSQL.

## Features

- **User Management**: Registration, login, and role-based access control
- **Content Management**: Manage nurseries, events, newsletters, and gallery
- **File Upload**: Support for images and PDF documents
- **Contact Forms**: Email notifications for contact submissions
- **Activity Logging**: Track user actions and system events
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: JWT + Session-based auth
- **File Storage**: Local file system
- **Email**: Nodemailer

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CMCNurseryWebsiteDemoTest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SESSION_SECRET`: Random string for session encryption
   - `JWT_SECRET`: Random string for JWT token signing
   - `SMTP_*`: Email configuration (optional)

4. **Set up the database**
   ```bash
   # Create database tables
   npm run db:push
   
   # Initialize database and create admin user
   npm run db:init
   
   # Optional: View database in Drizzle Studio
   npm run db:studio
   ```

5. **Start the application**
   
   The database initialization will create an admin user with:
   - Email: `admin@cmcnursery.com`
   - Password: `admin123`
   
   **Important**: Change this password after first login!

## Development

### Running the Application

**Option 1: Run both client and server together**
```bash
npm run dev
```

**Option 2: Run client and server separately**
```bash
# Terminal 1 - Server
npm run dev:server

# Terminal 2 - Client  
npm run dev:client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Development Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run dev:server` - Start server only with hot reload
- `npm run dev:client` - Start client only with Vite dev server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   NODE_ENV=production
   PORT=5000
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   └── main.tsx       # App entry point
│   └── index.html
├── server/                # Express backend
│   ├── auth.ts           # Authentication system
│   ├── db.ts             # Database connection
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data access layer
├── shared/               # Shared types and schemas
├── uploads/              # File uploads
├── public/               # Static files
└── dist/                 # Build output
```

## Authentication

The application uses a hybrid authentication system:

- **Sessions**: For server-side authentication
- **JWT Tokens**: For API access and client-side state

### User Roles

- `user`: Basic access
- `editor`: Can create/edit content
- `admin`: Can manage users and content
- `super_admin`: Full system access

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Content Management
- `GET /api/nurseries` - List nurseries
- `POST /api/nurseries` - Create nursery (admin)
- `PUT /api/nurseries/:id` - Update nursery (admin)
- `GET /api/events` - List events
- `POST /api/events` - Create event (editor+)
- `PUT /api/events/:id` - Update event (editor+)

### File Management
- `POST /api/upload` - Upload files
- `GET /uploads/*` - Serve uploaded files

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Session encryption key | Yes |
| `JWT_SECRET` | JWT signing key | Yes |
| `SMTP_HOST` | SMTP server host | No |
| `SMTP_PORT` | SMTP server port | No |
| `SMTP_USER` | SMTP username | No |
| `SMTP_PASS` | SMTP password | No |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 5000) | No |
| `HOST` | Server host (default: 0.0.0.0) | No |

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Verify `DATABASE_URL` is correct
   - Ensure PostgreSQL is running
   - Run `npm run db:push` to create tables

2. **Port conflicts**
   - Change `PORT` in `.env` file
   - Ensure ports 3000 and 5000 are available

3. **File upload issues**
   - Ensure `uploads/` directory exists
   - Check file permissions

4. **Authentication issues**
   - Verify `SESSION_SECRET` and `JWT_SECRET` are set
   - Clear browser cookies/session storage

### Development Tips

- Use `npm run db:studio` to inspect database
- Check server logs for detailed error messages
- Use browser dev tools to debug frontend issues
- Monitor network tab for API request/response details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
