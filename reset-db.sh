#!/bin/bash

# Database reset script
echo "🗑️  Resetting database..."

# Drop the existing database
dropdb -U postgres gom 2>/dev/null || true

# Create new database
createdb -U postgres gom

echo "✅ Database reset complete"
echo "📝 Now run: npm run db:push && npm run db:seed"
