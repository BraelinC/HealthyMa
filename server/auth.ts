import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { registerSchema, loginSchema, type User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "30d"; // Extended to 30 days for better persistence

// Support for old JWT secrets to handle rotation gracefully
const OLD_JWT_SECRETS = process.env.OLD_JWT_SECRETS 
  ? process.env.OLD_JWT_SECRETS.split(',') 
  : ["your-secret-key-change-in-production"]; // Add old secrets here

// Log JWT configuration (remove in production)
console.log("🔐 JWT Configuration:", {
  hasEnvSecret: !!process.env.JWT_SECRET,
  secretLength: JWT_SECRET.length,
  expiresIn: JWT_EXPIRES_IN,
  oldSecretsCount: OLD_JWT_SECRETS.length
});

export interface AuthRequest extends Request {
  user?: User;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token with support for old secrets
export function verifyToken(token: string): { userId: string; needsRefresh?: boolean } | null {
  // First try with current secret
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error: any) {
    // If it's not a signature error, token is invalid
    if (error.name !== 'JsonWebTokenError' || error.message !== 'invalid signature') {
      return null;
    }
    
    // Try with old secrets
    for (const oldSecret of OLD_JWT_SECRETS) {
      try {
        const decoded = jwt.verify(token, oldSecret) as { userId: string };
        // Token is valid but needs refresh with new secret
        return { ...decoded, needsRefresh: true };
      } catch {
        // Continue to next secret
      }
    }
    
    return null;
  }
}

// Auth middleware with automatic token refresh
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: "Invalid token" });
  }

  try {
    const user = await storage.getUser(Number(decoded.userId));
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    
    req.user = user;
    
    // If token needs refresh, add new token to response header
    if (decoded.needsRefresh) {
      const newToken = generateToken(decoded.userId);
      res.setHeader('X-New-Token', newToken);
      res.setHeader('Access-Control-Expose-Headers', 'X-New-Token');
      console.log(`🔄 Auto-refreshed token for user ${decoded.userId}`);
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication error" });
  }
}

// Flexible authentication middleware that supports JWT and session fallback
export async function authenticateFlexible(req: AuthRequest, res: Response, next: NextFunction) {
  // First try JWT authentication
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      try {
        const user = await storage.getUser(Number(decoded.userId));
        if (user) {
          req.user = user;
          
          // If token needs refresh, add new token to response header
          if (decoded.needsRefresh) {
            const newToken = generateToken(decoded.userId);
            res.setHeader('X-New-Token', newToken);
            res.setHeader('Access-Control-Expose-Headers', 'X-New-Token');
            console.log(`🔄 Auto-refreshed token for user ${decoded.userId}`);
          }
          
          return next();
        }
      } catch (error) {
        console.error('JWT user lookup error:', error);
      }
    }
  }
  
  // Fall back to session authentication
  if (req.session && req.session.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = user;
        
        // Generate a new JWT token for the session user
        const newToken = generateToken(user.id.toString());
        res.setHeader('X-New-Token', newToken);
        res.setHeader('Access-Control-Expose-Headers', 'X-New-Token');
        console.log(`🔐 Generated new token for session user ${user.id}`);
        
        return next();
      }
    } catch (error) {
      console.error('Session user lookup error:', error);
    }
  }
  
  // No valid authentication found
  return res.status(401).json({ message: "Authentication required" });
}

// Register user
export async function registerUser(req: Request, res: Response) {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await storage.createUser({
      email: validatedData.email,
      phone: validatedData.phone,
      password_hash: hashedPassword,
      full_name: validatedData.full_name,
    });

    // Generate token
    const token = generateToken(user.id.toString());

    // Return user data (without password) and token
    const { password_hash, ...userWithoutPassword } = user;
    res.status(201).json({
      user: userWithoutPassword,
      token,
      message: "User registered successfully"
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
}

// Login user with session support
export async function loginUser(req: Request, res: Response) {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user by email
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    if (!user.password_hash || !await verifyPassword(validatedData.password, user.password_hash)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user.id.toString());

    // Also store user ID in session as fallback
    if (req.session) {
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) console.error('Session save error:', err);
        else console.log(`✅ Session created for user ${user.id}`);
      });
    }

    // Return user data (without password) and token
    const { password_hash, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token,
      message: "Login successful"
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
}

// Get current user
export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { password_hash, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
}