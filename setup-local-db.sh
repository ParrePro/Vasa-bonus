#!/bin/bash

# Simplified Database Setup - Uses current user for PostgreSQL access
# This avoids needing the postgres password

set -e

echo "🗄️  Setting up local PostgreSQL database..."

# Database credentials
DB_NAME="school_star_points_dev"
DB_USER="school_user"
DB_PASSWORD="school_password_local"
DB_HOST="localhost"
DB_PORT="5432"

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   On macOS with Homebrew: brew services start postgresql@14"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Try to create database and user using createdb and createuser commands
echo "Creating database: $DB_NAME"
createdb -h $DB_HOST -p $DB_PORT $DB_NAME 2>/dev/null || echo "Database may already exist, continuing..."

echo "Creating database user: $DB_USER"
createuser -h $DB_HOST -p $DB_PORT $DB_USER 2>/dev/null || echo "User may already exist, continuing..."

# Run migrations
echo "Running migrations..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f server/migrations/001_init.sql 2>/dev/null || {
    echo "Trying with default authentication..."
    psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -f server/migrations/001_init.sql
}

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Connection details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "Update server/.env with:"
echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Connection details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "Add these to your .env.local file for the backend"
