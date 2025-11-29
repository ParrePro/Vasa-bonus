# Local Database Setup Guide

This guide will help you set up the VasaBonus app with a local PostgreSQL database instead of Supabase Cloud.

## Prerequisites

- PostgreSQL installed (you already have this!)
- Node.js/npm or bun
- Bash shell

## Step 1: Start PostgreSQL

On macOS with Homebrew:

```bash
brew services start postgresql
```

To verify PostgreSQL is running:

```bash
psql -U postgres -c "SELECT 1"
```

## Step 2: Set Up the Local Database

Run the setup script from the root directory:

```bash
chmod +x setup-local-db.sh
./setup-local-db.sh
```

This script will:
- Create a new database called `school_star_points`
- Create a database user `school_user`
- Run all migrations to set up tables
- Output connection details

## Step 3: Install Backend Dependencies

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
# or if using bun:
bun install
```

## Step 4: Configure Environment Variables

Create a `.env` file in the `server` directory with the following:

```
PORT=3001
DATABASE_URL=postgresql://school_user:school_password_local@localhost:5432/school_star_points
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

> ⚠️ **Important**: Change the JWT_SECRET to something unique for production!

## Step 5: Start the Backend Server

In the `server` directory, run:

```bash
npm run dev
```

You should see:
```
Server is running on http://localhost:3001
```

## Step 6: Update Frontend Configuration

The frontend is already configured to use the local API. The `.env.local` file includes:

```
VITE_API_URL=http://localhost:3001/api
```

## Step 7: Start the Frontend

In the root directory, open a new terminal and run:

```bash
npm run dev
# or
bun dev
```

The frontend should start on `http://localhost:5173`

## Step 8: Test the Setup

1. Open http://localhost:5173 in your browser
2. Create a new account
3. Try creating a class and adding points

## Troubleshooting

### PostgreSQL not running
```bash
brew services start postgresql
```

### "Database already exists" error
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS school_star_points;"
# Then run the setup script again
```

### Backend connection issues
- Verify DATABASE_URL in server/.env is correct
- Check that PostgreSQL is running
- Check that the database was created: `psql -U school_user -h localhost -d school_star_points`

### Frontend not connecting to backend
- Verify the backend is running on port 3001
- Check browser console for CORS errors
- Verify VITE_API_URL in .env.local

## Database Management

### View database contents:

```bash
psql -U school_user -h localhost -d school_star_points
```

Common commands:
```sql
\dt                    -- List all tables
\d profiles            -- Describe a table
SELECT * FROM profiles; -- Query a table
```

### Reset the database:

```bash
./setup-local-db.sh
```

## Deploying to Your Own Server

When ready to deploy to your server:

1. Install PostgreSQL on your server
2. Copy the `server/migrations/001_init.sql` and run it on your server's PostgreSQL
3. Deploy the Node.js backend to your server
4. Update the frontend's API_URL to point to your server
5. Update JWT_SECRET to a strong random value
6. Enable HTTPS for production

## File Structure

```
.
├── setup-local-db.sh              # Database setup script
├── .env.local                     # Frontend environment config
├── server/
│   ├── src/
│   │   ├── index.ts              # Main server file
│   │   ├── db.ts                 # Database connection
│   │   ├── auth.ts               # Authentication utilities
│   │   └── routes/
│   │       ├── auth.ts           # Auth endpoints
│   │       ├── classes.ts        # Classes endpoints
│   │       └── points.ts         # Points endpoints
│   ├── migrations/
│   │   └── 001_init.sql          # Database schema
│   ├── package.json
│   └── tsconfig.json
└── src/
    └── integrations/
        └── supabase/
            └── local-client.ts    # Local API client
```

## Questions or Issues?

Check the browser console and server logs for error messages. The error messages should guide you to the issue.
