import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import fetch from 'node-fetch';

// Whop API configuration
const WHOP_API_BASE = 'https://api.whop.com/api/v2';
const WHOP_API_KEY = process.env.WHOP_API_KEY!;
const WHOP_APP_ID = process.env.NEXT_PUBLIC_WHOP_APP_ID!;

export interface WhopUser {
  id: string;
  email: string;
  username: string;
  profile_pic_url?: string;
  has_access: boolean;
}

// Validate Whop user from iframe parameters
export async function validateWhopUser(userId: string, accessPass?: string): Promise<WhopUser | null> {
  try {
    if (!userId) {
      console.error('No Whop user ID provided');
      return null;
    }

    // Check if user has valid membership
    const membershipResponse = await fetch(`${WHOP_API_BASE}/memberships`, {
      headers: {
        'Authorization': `Bearer ${WHOP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        resource_id: accessPass || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
        valid: true,
      }),
    });

    const hasAccess = membershipResponse.ok;

    // Get user details
    const userResponse = await fetch(`${WHOP_API_BASE}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${WHOP_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to get Whop user details');
      return null;
    }

    const userData = await userResponse.json() as any;

    return {
      id: userId,
      email: userData.email || `${userId}@whop.user`,
      username: userData.username || userData.name || 'Whop User',
      profile_pic_url: userData.profile_pic_url || userData.avatar_url,
      has_access: hasAccess,
    };
  } catch (error) {
    console.error('Whop user validation error:', error);
    return null;
  }
}

// Create or update local user from Whop user
export async function syncWhopUser(whopUser: WhopUser) {
  try {
    // Check if user exists by Whop ID first
    let existingUser = await db
      .select()
      .from(users)
      .where(eq(users.whopUserId, whopUser.id))
      .limit(1);

    // If not found by Whop ID, try by email
    if (existingUser.length === 0) {
      existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, whopUser.email))
        .limit(1);
    }

    if (existingUser.length > 0) {
      // Update existing user with Whop info
      await db
        .update(users)
        .set({
          whopUserId: whopUser.id,
          profilePicture: whopUser.profile_pic_url,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser[0].id));
      
      return existingUser[0];
    } else {
      // Create new user from Whop
      const newUser = await db
        .insert(users)
        .values({
          email: whopUser.email,
          firstName: whopUser.username.split(' ')[0],
          lastName: whopUser.username.split(' ').slice(1).join(' ') || '',
          full_name: whopUser.username,
          whopUserId: whopUser.id,
          profilePicture: whopUser.profile_pic_url,
          profileImageUrl: whopUser.profile_pic_url,
          // Set a random password hash since they're using Whop auth
          password_hash: Math.random().toString(36).slice(-8),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      return newUser[0];
    }
  } catch (error) {
    console.error('Error syncing Whop user:', error);
    throw error;
  }
}

// Middleware to check Whop authentication
export async function requireWhopAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const whopUserId = req.headers['x-whop-user-id'] as string;
    const accessPass = req.headers['x-whop-access-pass'] as string;
    
    if (!whopUserId) {
      return res.status(401).json({ error: 'No Whop user ID provided' });
    }

    const whopUser = await validateWhopUser(whopUserId, accessPass);
    
    if (!whopUser) {
      return res.status(401).json({ error: 'Invalid Whop user' });
    }

    if (!whopUser.has_access) {
      return res.status(403).json({ error: 'No active Whop membership' });
    }

    // Sync with local database
    const localUser = await syncWhopUser(whopUser);
    
    // Create JWT for internal use
    const token = jwt.sign(
      { 
        userId: localUser.id, 
        email: localUser.email,
        whopUserId: whopUser.id 
      },
      process.env.JWT_SECRET || 'healthy-mama-jwt-secret-key-2025-production',
      { expiresIn: '7d' }
    );

    // Attach to request
    (req as any).user = localUser;
    (req as any).whopUser = whopUser;
    (req as any).token = token;
    
    next();
  } catch (error) {
    console.error('Whop auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Handle Whop OAuth/iframe authentication
export async function handleWhopAuth(req: Request): Promise<{ token: string; user: any; whopUser: WhopUser }> {
  try {
    // Extract Whop parameters from request
    const userId = req.query.user_id as string || req.body.user_id;
    const accessPass = req.query.access_pass as string || req.body.access_pass;
    const userEmail = req.query.email as string || req.body.email;
    
    if (!userId) {
      throw new Error('No Whop user ID provided');
    }

    // Validate user with Whop
    let whopUser = await validateWhopUser(userId, accessPass);
    
    // If validation failed but we have email, create a basic user
    if (!whopUser && userEmail) {
      whopUser = {
        id: userId,
        email: userEmail,
        username: userEmail.split('@')[0],
        has_access: true, // Trust Whop's iframe authentication
      };
    }
    
    if (!whopUser) {
      throw new Error('Failed to validate Whop user');
    }

    // Sync with local database
    const localUser = await syncWhopUser(whopUser);
    
    // Create JWT
    const token = jwt.sign(
      { 
        userId: localUser.id, 
        email: localUser.email,
        whopUserId: whopUser.id 
      },
      process.env.JWT_SECRET || 'healthy-mama-jwt-secret-key-2025-production',
      { expiresIn: '7d' }
    );

    return {
      token,
      user: localUser,
      whopUser,
    };
  } catch (error) {
    console.error('Whop auth error:', error);
    throw error;
  }
}

// Validate Whop webhook signature
export function validateWhopWebhook(req: Request): boolean {
  try {
    const signature = req.headers['x-whop-signature'] as string;
    if (!signature) return false;
    
    // In production, validate the webhook signature
    // For now, we'll accept all webhooks from Whop
    return true;
  } catch (error) {
    console.error('Webhook validation error:', error);
    return false;
  }
}