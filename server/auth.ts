import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { registerSchema, loginSchema, type User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

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

// Verify JWT token
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Auth middleware
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
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication error" });
  }
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
    const token = generateToken(user.id);

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

// Login user
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
    const token = generateToken(user.id);

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