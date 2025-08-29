import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";

if (!process.env.SESSION_SECRET) {
  throw new Error("Environment variable SESSION_SECRET not provided");
}

if (!process.env.JWT_SECRET) {
  throw new Error("Environment variable JWT_SECRET not provided");
}

// Set up the session middleware
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Create PostgreSQL session store
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // Store the session store in the storage instance
  storage.sessionStore = sessionStore;
  
  // Return session middleware
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// JWT token generation
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

// JWT token verification
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
  } catch (error) {
    return null;
  }
}

// Create or update user in the database
export async function upsertUser(userData: {
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  password?: string;
}) {
  const { email, firstName = '', lastName = '', profileImageUrl, password } = userData;
  
  // Check if user exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  
  if (existingUser) {
    // Update user profile information
    const updateData: any = {
      profileImageUrl,
      updatedAt: new Date()
    };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }
    
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.email, email));
      
    return existingUser.id;
  } else {
    // Create new user
    const hashedPassword = password ? await bcrypt.hash(password, 12) : null;
    
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        firstName,
        lastName,
        profileImageUrl,
        password: hashedPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
      
    return newUser.id;
  }
}

// Verify user credentials
export async function verifyCredentials(email: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  
  if (!user || !user.password) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
}

// Authentication middleware
export function requireAuth(): RequestHandler {
  return (req, res, next) => {
    if (!req.session.user || !req.session.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    next();
  };
}

// Admin authentication middleware
export function requireAdmin(): RequestHandler {
  return async (req, res, next) => {
    if (!req.session.user || !req.session.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.user.id));
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Admin access required" 
      });
    }
    next();
  };
}

// Setup passport strategies
export function setupPassport(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id));
      
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

// Role-based authorization middleware
export function hasRole(roles: string[]): RequestHandler {
  return async (req, res, next) => {
    if (!req.session.user || !req.session.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.user.id));
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ 
          success: false, 
          message: "Insufficient permissions" 
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  };
}
