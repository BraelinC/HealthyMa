import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check for DATABASE_URL in environment, handle .env override issue
let databaseUrl = process.env.DATABASE_URL;

// If .env file is overriding with empty string, this is a known issue
if (!databaseUrl || databaseUrl === "") {
  throw new Error(
    "DATABASE_URL must be set. The .env file may be overriding the environment variable. Please remove DATABASE_URL from .env or set it to a valid value.",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });