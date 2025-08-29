#!/usr/bin/env node

/**
 * Database initialization script
 * This script sets up the database and creates an initial admin user
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../shared/schema.ts';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

async function initDatabase() {
  console.log('🚀 Initializing database...');
  
  const sql = postgres(DATABASE_URL);
  const db = drizzle(sql);
  
  try {
    // Check if users table exists and has any users
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length === 0) {
      console.log('📝 No users found. Creating initial admin user...');
      
      // Create initial admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await db.insert(users).values({
        email: 'admin@cmcnursery.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'super_admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log('✅ Initial admin user created successfully!');
      console.log('📧 Email: admin@cmcnursery.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  Please change this password after first login!');
    } else {
      console.log('✅ Database already has users. Skipping initial user creation.');
    }
    
    console.log('🎉 Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the initialization
initDatabase();