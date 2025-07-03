import { Request } from 'express';
import { storage } from './storage';
import { InsertActivityLog } from '../shared/schema';

interface LogActivityParams {
  req: Request;
  action: string;
  entityType?: string;
  entityId?: number;
  nurseryId?: number;
  details?: Record<string, any>;
}

/**
 * Centralized activity logging utility
 * Logs admin actions with consistent formatting and context
 */
export async function logActivity({
  req,
  action,
  entityType,
  entityId,
  nurseryId,
  details = {}
}: LogActivityParams): Promise<void> {
  try {
    // Only log if user is authenticated
    if (!req.session?.user) {
      return;
    }

    const logData: InsertActivityLog = {
      userId: req.session.user.id,
      action,
      entityType,
      entityId,
      nurseryId,
      ipAddress: req.ip || req.connection.remoteAddress,
      details: {
        ...details,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        userRole: req.session.user.role
      }
    };

    await storage.logActivity(logData);
  } catch (error) {
    // Log activity logging errors but don't break the main operation
    console.error('Failed to log activity:', error);
  }
}

/**
 * Enhanced activity logging with entity details
 */
export async function logEntityActivity({
  req,
  action,
  entityType,
  entityId,
  entityData,
  nurseryId,
  previousData,
}: {
  req: Request;
  action: string;
  entityType: string;
  entityId?: number;
  entityData?: Record<string, any>;
  nurseryId?: number;
  previousData?: Record<string, any>;
}): Promise<void> {
  const details: Record<string, any> = {};

  if (entityData) {
    details.entityData = entityData;
  }

  if (previousData && action.includes('update')) {
    details.previousData = previousData;
    details.changes = getChanges(previousData, entityData || {});
  }

  await logActivity({
    req,
    action,
    entityType,
    entityId,
    nurseryId,
    details
  });
}

/**
 * Get differences between old and new data
 */
function getChanges(oldData: Record<string, any>, newData: Record<string, any>): Record<string, any> {
  const changes: Record<string, any> = {};
  
  // Find changed fields
  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      changes[key] = {
        from: oldData[key],
        to: newData[key]
      };
    }
  }
  
  return changes;
}

/**
 * Activity types for consistent logging
 */
export const ActivityTypes = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // User Management
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  DEACTIVATE_USER: 'deactivate_user',
  REACTIVATE_USER: 'reactivate_user',
  ASSIGN_NURSERY: 'assign_nursery',
  REMOVE_NURSERY: 'remove_nursery',
  
  // Event Management
  CREATE_EVENT: 'create_event',
  UPDATE_EVENT: 'update_event',
  DELETE_EVENT: 'delete_event',
  PUBLISH_EVENT: 'publish_event',
  
  // Newsletter Management
  CREATE_NEWSLETTER: 'create_newsletter',
  UPDATE_NEWSLETTER: 'update_newsletter',
  DELETE_NEWSLETTER: 'delete_newsletter',
  UPLOAD_NEWSLETTER: 'upload_newsletter',
  
  // Gallery Management
  UPLOAD_GALLERY_IMAGE: 'upload_gallery_image',
  UPDATE_GALLERY_IMAGE: 'update_gallery_image',
  DELETE_GALLERY_IMAGE: 'delete_gallery_image',
  CREATE_GALLERY_CATEGORY: 'create_gallery_category',
  DELETE_GALLERY_CATEGORY: 'delete_gallery_category',
  
  // Nursery Management
  CREATE_NURSERY: 'create_nursery',
  UPDATE_NURSERY: 'update_nursery',
  
  // Media Management
  UPLOAD_MEDIA: 'upload_media',
  DELETE_MEDIA: 'delete_media',
  
  // System Actions
  VIEW_ACTIVITY_LOGS: 'view_activity_logs',
  VIEW_DASHBOARD: 'view_dashboard',
  EXPORT_DATA: 'export_data',
  
  // Content Management
  CREATE_POST: 'create_post',
  UPDATE_POST: 'update_post',
  DELETE_POST: 'delete_post',
  PUBLISH_POST: 'publish_post'
} as const;

export type ActivityType = typeof ActivityTypes[keyof typeof ActivityTypes];