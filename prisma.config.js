import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: databaseUrl,
  },
});