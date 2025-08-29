# Migration Guide: From Replit to Standard Node.js Environment

This document outlines the changes made to migrate the CMC Nursery Website from a Replit-specific environment to a standard Node.js environment.

## Major Changes

### 1. Removed Replit-Specific Dependencies

**Removed from package.json:**
- `@replit/vite-plugin-shadcn-theme-json`
- `@replit/vite-plugin-cartographer`
- `@replit/vite-plugin-runtime-error-modal`
- `openid-client`

**Added to package.json:**
- `jsonwebtoken` - For JWT-based authentication
- `nanoid` - For generating unique IDs
- `concurrently` - For running client and server together
- `postgres` - For database initialization script
- `dotenv` - For environment variable management

### 2. Authentication System Overhaul

**Replaced:**
- `server/replitAuth.ts` - Replit-specific OpenID authentication
- Replit domain-based authentication
- Replit session management

**With:**
- `server/auth.ts` - Standard JWT + Session authentication
- Email/password registration and login
- Role-based access control
- Session management with PostgreSQL

**New Authentication Endpoints:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### 3. Vite Configuration Updates

**Removed:**
- Replit-specific plugins
- Replit theme configuration
- Replit runtime error overlay

**Added:**
- Development server proxy configuration
- Standard React plugin setup
- Port configuration (3000 for client, 5000 for server)

### 4. Server Configuration Changes

**Updated:**
- Environment-based configuration
- Flexible port and host settings
- Standard session management
- Removed Replit-specific server options

### 5. Database Schema Updates

**Modified:**
- Made password field optional in users table
- Updated user schema validation
- Added support for password-based authentication

### 6. Development Workflow Changes

**New Scripts:**
- `npm run dev` - Run both client and server
- `npm run dev:server` - Run server only
- `npm run dev:client` - Run client only
- `npm run db:init` - Initialize database and create admin user

**Removed:**
- Replit-specific startup scripts
- Replit deployment configuration

## File Changes Summary

### Files Removed
- `.replit` - Replit configuration
- `replit.nix` - Replit Nix configuration
- `replit.md` - Replit documentation
- `server/replitAuth.ts` - Replit authentication

### Files Modified
- `package.json` - Updated dependencies and scripts
- `vite.config.ts` - Removed Replit plugins, added proxy
- `server/index.ts` - Updated authentication setup
- `server/routes.ts` - Updated authentication middleware
- `shared/schema.ts` - Made password optional
- `.gitignore` - Added standard Node.js ignores

### Files Added
- `server/auth.ts` - New authentication system
- `env.example` - Environment variables template
- `README.md` - Comprehensive setup guide
- `scripts/init-db.js` - Database initialization script
- `start.bat` - Windows development startup script
- `start-production.bat` - Windows production startup script
- `MIGRATION_GUIDE.md` - This document

## Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `JWT_SECRET` - JWT signing key

**Optional:**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `HOST` - Server host (default: 0.0.0.0)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your settings
   ```

3. **Set up database:**
   ```bash
   npm run db:push
   npm run db:init
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

## Authentication Migration

### For Existing Users
If you have existing users in the database:

1. **Update user passwords:** Users will need to reset their passwords since the authentication system has changed
2. **Update user roles:** Ensure users have appropriate roles assigned
3. **Test authentication:** Verify login/logout functionality

### Default Admin User
The database initialization script creates a default admin user:
- Email: `admin@cmcnursery.com`
- Password: `admin123`
- Role: `super_admin`

**Important:** Change this password immediately after first login!

## Development vs Production

### Development
- Client runs on port 3000 with Vite dev server
- Server runs on port 5000
- Hot reload enabled for both client and server
- Proxy configuration for API calls

### Production
- Single server on port 5000 (configurable)
- Serves built client files
- No development dependencies
- Optimized for performance

## Troubleshooting

### Common Issues

1. **Port conflicts:** Change ports in `.env` file
2. **Database connection:** Verify `DATABASE_URL` and PostgreSQL setup
3. **Authentication errors:** Check `SESSION_SECRET` and `JWT_SECRET`
4. **File uploads:** Ensure `uploads/` directory exists and is writable

### Migration Checklist

- [ ] Install new dependencies
- [ ] Configure environment variables
- [ ] Set up PostgreSQL database
- [ ] Run database initialization
- [ ] Test authentication system
- [ ] Verify file uploads work
- [ ] Test all API endpoints
- [ ] Update deployment scripts (if applicable)

## Benefits of Migration

1. **Standard Environment:** No longer tied to Replit platform
2. **Better Authentication:** More secure and flexible auth system
3. **Improved Development:** Better hot reload and debugging
4. **Production Ready:** Optimized for deployment on any platform
5. **Better Documentation:** Comprehensive setup and usage guides
6. **Flexible Configuration:** Environment-based configuration
7. **Standard Tooling:** Uses industry-standard Node.js tools

## Support

For issues related to the migration:
1. Check the troubleshooting section in README.md
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check server logs for detailed error messages
