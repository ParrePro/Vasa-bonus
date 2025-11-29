# VasaBonus

A school rewards and points system where teachers can award points to students, and students can redeem them for rewards.

## Features

- **Teacher Dashboard**: Create classes, add students, give/remove points, manage rewards
- **Student Dashboard**: View points, redeem rewards, customize avatar, see class members
- **Developer Dashboard**: Admin view for managing schools and all classes
- **Tier System**: Students unlock avatar customization options as they earn more points (Basic → Silver → Gold → Ruby)
- **Avatar Customization**: Bitmoji-style avatars with skins, hair, eyes, accessories, backgrounds, borders, and effects

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL 16
- **Containerization**: Docker & Docker Compose

---

## Hosting on Linux

### Prerequisites

Install Docker and Docker Compose:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (logout/login required after)
sudo usermod -aG docker $USER
```

### Step 1: Clone the Repository

```bash
git clone https://github.com/ParrePro/Vasa-bonus.git
cd Vasa-bonus
```

### Step 2: Start the Application

```bash
# Start all containers (database, backend, frontend)
docker-compose up -d
```

This will:
- Start a PostgreSQL 16 database
- Start the Express.js backend API on port 3001
- Start the Vite frontend on port 8080
- Automatically create all database tables

### Step 3: Access the Application

Open your browser and go to:
- **Frontend**: `http://localhost:8080` (or `http://YOUR_SERVER_IP:8080`)
- **API**: `http://localhost:3001/api`

### Step 4: Create Your First Account

1. Go to the application in your browser
2. Click "Sign Up" to create an account
3. Choose your role (Teacher or Student)
4. Start using the app!

---

## Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

### Stop the Application
```bash
docker-compose down
```

### Restart the Application
```bash
docker-compose restart
```

### Rebuild After Code Changes
```bash
docker-compose down
docker-compose up -d --build
```

### Reset Database (Delete All Data)
```bash
docker-compose down
docker volume rm vasa-bonus_postgres_data
docker-compose up -d
```

---

## Network Access

To access from other devices on your network:

1. Find your server's IP address:
   ```bash
   ip addr show | grep "inet "
   ```

2. Open firewall ports (if needed):
   ```bash
   # Ubuntu with UFW
   sudo ufw allow 8080/tcp
   sudo ufw allow 3001/tcp
   ```

3. Access from other devices at `http://YOUR_SERVER_IP:8080`

---

## Production Deployment Tips

For production use, consider:

1. **Change JWT Secret**: Edit `docker-compose.yml` and set a strong random `JWT_SECRET`
2. **Change Database Password**: Update `POSTGRES_PASSWORD` in `docker-compose.yml`
3. **Use HTTPS**: Put a reverse proxy (nginx/Caddy) in front with SSL certificates
4. **Backup Database**: Set up regular PostgreSQL backups
5. **Use a Domain**: Point a domain to your server

### Example Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }
}
```

---

## Database Details

- **Type**: PostgreSQL 16
- **Port**: 5432
- **Username**: school_user
- **Password**: school_password_local
- **Database**: school_star_points_dev

Data is persisted in a Docker volume, so it survives container restarts.

---

## Troubleshooting

### Containers not starting
```bash
# Check status
docker-compose ps

# View error logs
docker-compose logs
```

### Database connection errors
Wait 10-15 seconds after starting - the database needs time to initialize.

### Port already in use
Edit `docker-compose.yml` to change ports:
```yaml
ports:
  - "8081:8080"  # Change frontend port
  - "3002:3001"  # Change API port
```

### Permission denied errors
Make sure your user is in the docker group:
```bash
sudo usermod -aG docker $USER
# Then logout and login again
```

---

## Development

To run in development mode (with hot reload):

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start database only
docker-compose up -d postgres

# Run backend (in one terminal)
cd server && npm run dev

# Run frontend (in another terminal)
npm run dev
```

---

## License

Private repository - all rights reserved.
