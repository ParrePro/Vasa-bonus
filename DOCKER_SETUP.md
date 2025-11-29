# Self-Hosted Database Setup with Docker

This guide will help you run the VasaBonus application with a self-hosted PostgreSQL database using Docker instead of Supabase.

## Prerequisites

- Docker and Docker Compose installed on your machine
- Node.js 20+ installed locally (for running the frontend in development mode)
- Bun package manager (or npm as fallback)

## Quick Start

### 1. Start the Docker containers

```bash
# Navigate to the project root
cd /path/to/school-star-points-main

# Start PostgreSQL and Express backend containers
docker-compose up -d
```

This will:
- Spin up a PostgreSQL 16 container with the database schema initialized
- Spin up an Express backend container that connects to the database
- Create a Docker network for the containers to communicate

### 2. Verify containers are running

```bash
# Check container status
docker-compose ps

# View logs from backend
docker-compose logs -f backend

# View logs from database
docker-compose logs -f postgres
```

### 3. Run the frontend (in a new terminal)

```bash
# Install dependencies (if needed)
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Access the API

The backend API runs at `http://localhost:3001/api` and is automatically configured in the frontend.

## Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=http://localhost:3001
VITE_SUPABASE_PUBLISHABLE_KEY=local_anon_key
VITE_USE_LOCAL_API=true
```

### Backend (server/.env.local)
```env
DATABASE_URL=postgresql://school_user:school_password_local@postgres:5432/school_star_points_dev
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## Database

- **Type**: PostgreSQL 16
- **Container Name**: school_star_points_db
- **Host**: localhost (from host machine) or postgres (from Docker)
- **Port**: 5432
- **Username**: school_user
- **Password**: school_password_local
- **Database**: school_star_points_dev

### Database Schema

The database schema is initialized automatically from `server/migrations/001_init.sql` when the container starts. This includes:

- `auth_users` - User authentication
- `profiles` - User profiles
- `user_roles` - User roles (teacher, student, developer)
- `classes` - Class records
- `class_members` - Class memberships
- `points_transactions` - Point transfer transactions
- `default_point_reasons` - Default point categories
- `campaigns` - Point campaigns
- `campaign_classes` - Campaign assignments

### Database Persistence

Data is stored in a Docker volume named `postgres_data`. This means your data persists even if containers are stopped/restarted.

To reset the database:
```bash
# Stop containers
docker-compose down

# Remove the volume (WARNING: deletes all data)
docker volume rm school-star-points_postgres_data

# Start fresh
docker-compose up -d
```

## API Endpoints

The Express backend provides these main endpoints:

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/classes` - Get user's classes
- `POST /api/classes` - Create new class
- `GET /api/points` - Get point transactions
- `POST /api/points` - Create point transaction

Full API documentation available in backend code at `server/src/routes/`

## Troubleshooting

### Database connection errors

If you see "Connection refused" errors:

1. Wait a few seconds for the database to fully initialize
2. Check if containers are healthy:
   ```bash
   docker-compose ps
   ```
3. Check logs:
   ```bash
   docker-compose logs postgres
   docker-compose logs backend
   ```

### Backend not connecting to database

Ensure `DATABASE_URL` in `server/.env.local` uses the Docker hostname:
```
DATABASE_URL=postgresql://school_user:school_password_local@postgres:5432/school_star_points_dev
```
(Note: `postgres` is the Docker service name, not `localhost`)

### Frontend can't reach API

Ensure `VITE_API_URL` in `.env.local` is set to:
```
VITE_API_URL=http://localhost:3001/api
```

### Port conflicts

If ports 5432 (database) or 3001 (backend) are already in use, modify `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Use 5433 on host instead of 5432
```

Then update `DATABASE_URL` accordingly.

### Rebuild containers

If you change code or dependencies:

```bash
docker-compose down
docker-compose up -d --build
```

### View live logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

## Development Workflow

### Making backend changes

Changes to `server/src/` are automatically reloaded due to the volume mount and `npm run dev` command.

### Making database changes

If you need to modify the schema:

1. Update `server/migrations/001_init.sql`
2. Reset the database:
   ```bash
   docker-compose down
   docker volume rm school-star-points_postgres_data
   docker-compose up -d
   ```

### Installing new dependencies

```bash
# Backend
cd server
npm install <package-name>
cd ..
docker-compose up -d --build

# Frontend
npm install <package-name>
npm run dev
```

## Production Deployment

When deploying to production:

1. Change `JWT_SECRET` to a strong random value
2. Use environment-specific database credentials
3. Set `NODE_ENV=production`
4. Use a proper database backup solution
5. Consider using a database managed service (RDS, etc.)
6. Deploy the Docker containers to your hosting platform

## Switching back to Supabase

If you need to go back to Supabase:

1. Update imports from `local-client` back to `client` in component files
2. Set up proper Supabase environment variables in `.env`
3. Ensure `@supabase/supabase-js` is in dependencies

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)

---

**Last Updated**: November 25, 2025
**Setup Type**: Self-hosted PostgreSQL with Docker
