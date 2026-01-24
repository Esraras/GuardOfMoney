import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  earlyAccess: true, 
  datasource: {
    url: process.env.DATABASE_URL, 
  },
});