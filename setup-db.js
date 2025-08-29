#!/usr/bin/env node

/**
 * Database setup script
 * This script sets up the database schema without interactive prompts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

async function setupDatabase() {
  console.log('🚀 Setting up database...');
  
  const sql = postgres(DATABASE_URL);
  const db = drizzle(sql);
  
  try {
    // Create tables manually to avoid interactive prompts
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'editor',
        nursery_id INTEGER,
        profile_image_url VARCHAR(255),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS nurseries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL UNIQUE,
        address VARCHAR(255) NOT NULL,
        phone_number VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        opening_hours JSONB NOT NULL,
        hero_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        featured_image VARCHAR(255),
        nursery_id INTEGER NOT NULL,
        author_id INTEGER NOT NULL,
        status VARCHAR(255) NOT NULL DEFAULT 'draft',
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        location VARCHAR(255),
        nursery_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS newsletters (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        filename VARCHAR(255) NOT NULL,
        month VARCHAR(255),
        year VARCHAR(255),
        nursery_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS gallery_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        filename VARCHAR(255) NOT NULL,
        nursery_id INTEGER,
        category_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR(255) PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `;
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions ("expire");`;
    
    console.log('✅ Database tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the setup
setupDatabase();
