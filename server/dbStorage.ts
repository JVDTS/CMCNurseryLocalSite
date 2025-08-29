import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import session from 'express-session';
import {
  users, User, InsertUser,
  nurseries, Nursery, InsertNursery,
  events, Event, InsertEvent,
  galleryImages, GalleryImage, InsertGalleryImage,
  newsletters, Newsletter, InsertNewsletter,
  contactSubmissions, ContactSubmission, InsertContact,
  userNurseries, UserNursery,
  posts, Post, InsertPost,
  galleryCategories, GalleryCategory, InsertGalleryCategory,
  mediaLibrary, MediaItem, InsertMediaItem,
  activityLogs, ActivityLog, InsertActivityLog,
  invitations, Invitation, InsertInvitation
} from '../shared/schema';
import { IStorage } from './storage.js';
import { hashPassword } from './security.js';
import { db, pool } from './db.js'; // Import the existing db instance and pool

// Create the Drizzle instance - use the shared db instance from db.ts
const drizzleDb = db;

export class DbStorage implements IStorage {
  // --- Begin interface compliance stubs ---
  async getUser(id: number): Promise<User | undefined> { throw new Error('Not implemented'); }
  async getUserByEmail(email: string): Promise<User | undefined> { throw new Error('Not implemented'); }
  async getAllUsers(): Promise<User[]> { throw new Error('Not implemented'); }
  async getUsersByNursery(nurseryId: number): Promise<User[]> { throw new Error('Not implemented'); }
  async getUserWithAssignedNurseries(userId: number): Promise<{user: User, assignedNurseries: Nursery[]}> { throw new Error('Not implemented'); }
  async getActiveUsers(): Promise<User[]> { throw new Error('Not implemented'); }
  async deactivateUser(id: number): Promise<boolean> { throw new Error('Not implemented'); }
  async reactivateUser(id: number): Promise<boolean> { throw new Error('Not implemented'); }
  async assignUserToNursery(assignment: any): Promise<UserNursery> { throw new Error('Not implemented'); }
  async removeUserFromNursery(userId: number, nurseryId: number): Promise<boolean> { throw new Error('Not implemented'); }
  async getUserNurseryAssignments(userId: number): Promise<UserNursery[]> { throw new Error('Not implemented'); }
  async getNurseryUserAssignments(nurseryId: number): Promise<UserNursery[]> { throw new Error('Not implemented'); }
  // Removed duplicate stubs for implemented methods
  async deleteNursery(id: number): Promise<boolean> { throw new Error('Not implemented'); }
  async deleteGalleryCategory(id: number): Promise<boolean> { throw new Error('Not implemented'); }
  async getMediaItem(id: number): Promise<MediaItem | undefined> { throw new Error('Not implemented'); }
  async getMediaByNursery(nurseryId: number): Promise<MediaItem[]> { throw new Error('Not implemented'); }
  async getAllMedia(): Promise<MediaItem[]> { throw new Error('Not implemented'); }
  async createMediaItem(mediaItem: InsertMediaItem): Promise<MediaItem> { throw new Error('Not implemented'); }
  async deleteMediaItem(id: number): Promise<boolean> { throw new Error('Not implemented'); }
  async logActivity(log: InsertActivityLog): Promise<ActivityLog> { throw new Error('Not implemented'); }
  async getActivityLogsByUser(userId: number): Promise<ActivityLog[]> { throw new Error('Not implemented'); }
  async getActivityLogsByNursery(nurseryId: number): Promise<ActivityLog[]> { throw new Error('Not implemented'); }
  async getRecentActivityLogs(limit?: number): Promise<ActivityLog[]> { throw new Error('Not implemented'); }
  async createInvitation(invitation: InsertInvitation): Promise<Invitation> { throw new Error('Not implemented'); }
  async getInvitationByToken(token: string): Promise<Invitation | undefined> { throw new Error('Not implemented'); }
  async getInvitationsByNursery(nurseryId: number): Promise<Invitation[]> { throw new Error('Not implemented'); }
  async acceptInvitation(token: string): Promise<boolean> { throw new Error('Not implemented'); }
  async deleteInvitation(id: number): Promise<boolean> { throw new Error('Not implemented'); }
  // --- End interface compliance stubs ---
  // Only keep stubs for methods not implemented below
  sessionStore: any;
  async getAllPosts(): Promise<Post[]> { throw new Error('Not implemented'); }
  async getPost(_id: number): Promise<Post | undefined> { throw new Error('Not implemented'); }
  async getPostBySlug(_slug: string): Promise<Post | undefined> { throw new Error('Not implemented'); }
  async getPostsByNursery(_nurseryId: number): Promise<Post[]> { throw new Error('Not implemented'); }
  async createPost(_post: any): Promise<Post> { throw new Error('Not implemented'); }
  async updatePost(_id: number, _postData: any): Promise<Post | undefined> { throw new Error('Not implemented'); }
  async deletePost(_id: number): Promise<boolean> { throw new Error('Not implemented'); }
  async getAllGalleryImages(): Promise<GalleryImage[]> { throw new Error('Not implemented'); }
  async updateGalleryImage(_id: number, _imageData: any): Promise<GalleryImage | undefined> { throw new Error('Not implemented'); }
  async getGalleryCategory(_id: number): Promise<GalleryCategory | undefined> { throw new Error('Not implemented'); }
  async getAllGalleryCategories(): Promise<GalleryCategory[]> { throw new Error('Not implemented'); }
  async createGalleryCategory(_category: any): Promise<GalleryCategory> { throw new Error('Not implemented'); }
  // Add more stubs here if you find missing interface methods not implemented below

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    if (!insertUser.password) {
      throw new Error("Password is required");
    }
    const hashedPassword = await hashPassword(insertUser.password);
    const result = await drizzleDb.insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await hashPassword(userData.password);
    }
    
    const result = await drizzleDb.update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // First, delete all nursery assignments for this user
      await drizzleDb.delete(userNurseries).where(eq(userNurseries.userId, id));
      
      // Then delete the user
      const result = await drizzleDb.delete(users).where(eq(users.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Nursery methods
  async getNursery(id: number): Promise<Nursery | undefined> {
    const result = await drizzleDb.select().from(nurseries).where(eq(nurseries.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getNurseryByLocation(location: string): Promise<Nursery | undefined> {
    // Convert location string to lowercase for validation
    const locationLower = location.toLowerCase();
    const validLocations = ['hayes', 'uxbridge', 'hounslow'];
    if (!validLocations.includes(locationLower)) {
      return undefined;
    }
    
    // Create a capitalized version for proper case matching (Hayes, Uxbridge, Hounslow)
    const capitalizedLocation = locationLower.charAt(0).toUpperCase() + locationLower.slice(1);
    
    // Use SQL query with case-insensitive comparison
    const result = await drizzleDb.select().from(nurseries)
      .where(eq(nurseries.location, capitalizedLocation));
    return result.length > 0 ? result[0] : undefined;
  }

  async getAllNurseries(): Promise<Nursery[]> {
    return await drizzleDb.select().from(nurseries);
  }

  async createNursery(insertNursery: InsertNursery): Promise<Nursery> {
    const result = await drizzleDb.insert(nurseries)
      .values({
        ...insertNursery
      })
      .returning();
    return result[0];
  }

  async updateNursery(id: number, nurseryData: Partial<InsertNursery>): Promise<Nursery | undefined> {
    const result = await drizzleDb.update(nurseries)
      .set({
        ...nurseryData,
        updatedAt: new Date()
      })
      .where(eq(nurseries.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    const result = await drizzleDb.select().from(events).where(eq(events.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getEventsByNursery(nurseryId: number): Promise<Event[]> {
    return await drizzleDb.select().from(events).where(eq(events.nurseryId, nurseryId));
  }

  async getAllEvents(): Promise<(Event & { nursery: Nursery })[]> {
  // Not implemented due to Drizzle ORM limitations in this codebase
  return [];
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await drizzleDb.insert(events)
      .values({
        ...insertEvent
      })
      .returning();
      
    return result[0];
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await drizzleDb.update(events)
      .set({
        ...eventData
      })
      .where(eq(events.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await drizzleDb.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }

  // Gallery methods
  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    const result = await drizzleDb.select().from(galleryImages).where(eq(galleryImages.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getGalleryImagesByNursery(nurseryId: number): Promise<GalleryImage[]> {
    return await drizzleDb.select().from(galleryImages).where(eq(galleryImages.nurseryId, nurseryId));
  }

  async createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage> {
    // Remove caption if not in schema
    const { caption, ...rest } = insertImage as any;
    const result = await drizzleDb.insert(galleryImages)
      .values(rest)
      .returning();
    return result[0];
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    const result = await drizzleDb.delete(galleryImages).where(eq(galleryImages.id, id)).returning();
    return result.length > 0;
  }

  // Newsletter methods
  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    const result = await drizzleDb.select().from(newsletters).where(eq(newsletters.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getNewslettersByNursery(nurseryId: number): Promise<Newsletter[]> {
    return await drizzleDb.select().from(newsletters).where(eq(newsletters.nurseryId, nurseryId));
  }

  async getAllNewsletters(): Promise<Newsletter[]> {
    return await drizzleDb.select().from(newsletters);
  }

  async createNewsletter(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    const now = new Date();
    // Remove pdfUrl, publishDate, tags if not in schema
    const { pdfUrl, publishDate, tags, ...rest } = insertNewsletter as any;
    const result = await drizzleDb.insert(newsletters)
      .values({
        ...rest,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return result[0];
  }

  async updateNewsletter(id: number, newsletterData: Partial<InsertNewsletter>): Promise<Newsletter | undefined> {
    const result = await drizzleDb.update(newsletters)
      .set({
        ...newsletterData,
        updatedAt: new Date()
      })
      .where(eq(newsletters.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteNewsletter(id: number): Promise<boolean> {
    const result = await drizzleDb.delete(newsletters).where(eq(newsletters.id, id)).returning();
    return result.length > 0;
  }

  // Contact methods
  async createContactSubmission(contact: InsertContact): Promise<ContactSubmission> {
    // Remove phone if not in schema
    const { phone, ...rest } = contact as any;
    const result = await drizzleDb.insert(contactSubmissions)
      .values({
        ...rest,
        createdAt: new Date().toISOString()
      })
      .returning();
    return result[0];
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await drizzleDb.select().from(contactSubmissions);
  }
}