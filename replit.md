# Coat of Many Colours Nursery CMS

## Overview

This is a comprehensive Content Management System (CMS) for Coat of Many Colours Nursery, built with a modern full-stack architecture. The system manages multiple nursery locations across Hayes, Uxbridge, and Hounslow, providing both a public-facing website and an admin dashboard for content management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **UI Library**: Radix UI primitives with custom theming

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based authentication with express-session
- **File Handling**: Express-fileupload for media uploads
- **Security**: Helmet for security headers, bcrypt for password hashing

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon Database)
- **Session Storage**: PostgreSQL-backed session store
- **File Storage**: Local filesystem with `/uploads` directory
- **Media Processing**: PDF thumbnail generation with pdf.js and canvas

## Key Components

### Database Schema
- **Users**: Multi-role system (super_admin, admin, editor) with nursery assignments
- **Nurseries**: Multi-location support with individual configurations
- **Content Management**: Events, newsletters, gallery images, posts
- **Activity Logging**: Comprehensive audit trail for admin actions
- **Invitations**: User invitation system for role-based access

### Authentication & Authorization
- **Session-based Authentication**: Uses PostgreSQL session store
- **Role-based Access Control**: Three-tier permission system
- **Multi-nursery Support**: Users can be assigned to multiple nurseries
- **Admin Middleware**: Separate authentication layer for admin functions

### Content Management Features
- **Events Management**: Create and manage nursery events with location-specific filtering
- **Newsletter System**: PDF upload and management with thumbnail generation
- **Gallery Management**: Image upload with categorization and nursery assignment
- **Media Library**: Centralized media asset management
- **User Management**: Admin tools for user creation and role assignment

## Data Flow

1. **Client Requests**: React frontend makes API calls through TanStack Query
2. **Authentication**: Express middleware validates sessions and roles
3. **Database Operations**: Drizzle ORM handles database interactions
4. **File Processing**: Server processes uploads and generates thumbnails
5. **Response**: JSON responses with error handling and validation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **express-session**: Session management
- **bcryptjs**: Password hashing
- **helmet**: Security middleware
- **nodemailer**: Email functionality

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **framer-motion**: Animation library
- **wouter**: Lightweight routing
- **react-hook-form**: Form management

### Development Dependencies
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution
- **esbuild**: Production bundling

## Deployment Strategy

### Environment Configuration
- **Development**: Vite dev server with hot module replacement
- **Production**: Express server serving static assets
- **Database**: PostgreSQL with environment-based connection strings

### Build Process
1. **Frontend Build**: Vite bundles React application to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database Migrations**: Drizzle Kit handles schema migrations

### Replit Configuration
- **Deployment Target**: Google Cloud Run
- **Port Configuration**: Internal port 5000, external port 80
- **Package Management**: npm with automatic installation
- **Environment**: Node.js 20 with PostgreSQL system dependencies

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- June 26, 2025: Implemented complete nursery-based permissions system
  - Added `/api/admin/me/nurseries` endpoint to fetch user's assigned nurseries
  - Applied nursery restrictions to both gallery and newsletter management
  - Fixed Hayes user nursery assignment (properly assigned to Hayes nursery ID: 1)
  - Users now see only their assigned nurseries in all upload/creation dropdowns
  - Consistent location-based naming across all nursery selections
  - Super admins maintain access to all nurseries for system administration
- June 26, 2025: Fixed gallery homepage nursery display issue
  - Corrected data structure mismatch in nurseries API consumption
  - Gallery images now properly show assigned nursery names instead of "Unknown Nursery"
  - Fixed newsletter deletion authentication by switching to admin endpoint
- June 26, 2025: Added complete user deletion functionality to admin panel
  - Implemented DELETE /api/admin/users/:id endpoint with security checks
  - Added permanent user deletion option alongside deactivate/reactivate
  - Enhanced user management UI with delete button and confirmation
  - Prevents self-deletion and deletion of other super admins
  - Includes comprehensive activity logging for audit trail

## Changelog

Changelog:
- June 26, 2025. Initial setup