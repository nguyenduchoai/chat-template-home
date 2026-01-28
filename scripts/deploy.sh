#!/bin/bash

# ============================================
# Deployment Script for Chat Template Home
# Deploy to VPS with MySQL + PM2 + Nginx
# ============================================

set -e

# Configuration
APP_NAME="chat-template-home"
APP_DIR="/var/www/${APP_NAME}"
REPO_URL="https://github.com/nguyenduchoai/chat-template-home.git"
BRANCH="main"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment of ${APP_NAME}...${NC}"

# ============================================
# Phase 1: System Setup (Run once on new VPS)
# ============================================
setup_system() {
    echo -e "${YELLOW}📦 Setting up system dependencies...${NC}"
    
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install Node.js
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt install -y nodejs
    
    # Install PM2
    sudo npm install -g pm2
    
    # Install MySQL
    sudo apt install -y mysql-server
    sudo mysql_secure_installation
    
    # Install Nginx
    sudo apt install -y nginx
    
    # Install Git
    sudo apt install -y git
    
    echo -e "${GREEN}✅ System setup complete!${NC}"
}

# ============================================
# Phase 2: Database Setup
# ============================================
setup_database() {
    echo -e "${YELLOW}📊 Setting up MySQL database...${NC}"
    
    read -p "Enter MySQL root password: " MYSQL_ROOT_PASSWORD
    read -p "Enter database name [chat_template]: " DB_NAME
    DB_NAME=${DB_NAME:-chat_template}
    read -p "Enter database user [chat_user]: " DB_USER
    DB_USER=${DB_USER:-chat_user}
    read -p "Enter database password: " DB_PASSWORD
    
    # Create database and user
    mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<EOF
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

    # Run schema
    echo -e "${YELLOW}Running MySQL schema...${NC}"
    mysql -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < mysql/schema.sql
    
    echo -e "${GREEN}✅ Database setup complete!${NC}"
}

# ============================================
# Phase 3: Application Deployment
# ============================================
deploy() {
    echo -e "${YELLOW}📦 Deploying application...${NC}"
    
    # Create app directory
    sudo mkdir -p ${APP_DIR}
    sudo chown -R $USER:$USER ${APP_DIR}
    
    # Clone or pull repository
    if [ -d "${APP_DIR}/.git" ]; then
        echo "Pulling latest changes..."
        cd ${APP_DIR}
        git fetch origin
        git reset --hard origin/${BRANCH}
    else
        echo "Cloning repository..."
        git clone -b ${BRANCH} ${REPO_URL} ${APP_DIR}
        cd ${APP_DIR}
    fi
    
    # Install dependencies
    echo "Installing dependencies..."
    npm ci --production=false
    
    # Build application
    echo "Building application..."
    npm run build
    
    # Create uploads directory
    mkdir -p ${APP_DIR}/public/uploads
    chmod 755 ${APP_DIR}/public/uploads
    
    # Create PM2 log directory
    sudo mkdir -p /var/log/pm2
    sudo chown -R $USER:$USER /var/log/pm2
    
    # Start/Restart with PM2
    echo "Starting application with PM2..."
    pm2 delete ${APP_NAME} 2>/dev/null || true
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    echo -e "${GREEN}✅ Deployment complete!${NC}"
}

# ============================================
# Phase 4: Nginx Configuration
# ============================================
setup_nginx() {
    echo -e "${YELLOW}🌐 Setting up Nginx...${NC}"
    
    read -p "Enter domain name (e.g., example.com): " DOMAIN
    
    # Create Nginx config
    sudo tee /etc/nginx/sites-available/${APP_NAME} > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Redirect HTTP to HTTPS
    # Uncomment after setting up SSL
    # return 301 https://\$server_name\$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files
    location /_next/static {
        alias ${APP_DIR}/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Uploads
    location /uploads {
        alias ${APP_DIR}/public/uploads;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    
    echo -e "${GREEN}✅ Nginx setup complete!${NC}"
    echo -e "${YELLOW}💡 For SSL, run: sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}${NC}"
}

# ============================================
# Phase 5: SSL Setup with Certbot
# ============================================
setup_ssl() {
    echo -e "${YELLOW}🔒 Setting up SSL with Certbot...${NC}"
    
    # Install Certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    read -p "Enter domain name (e.g., example.com): " DOMAIN
    
    # Get SSL certificate
    sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}
    
    # Auto-renewal
    sudo systemctl enable certbot.timer
    
    echo -e "${GREEN}✅ SSL setup complete!${NC}"
}

# ============================================
# Quick Deploy (Pull, Build, Restart)
# ============================================
quick_deploy() {
    echo -e "${YELLOW}🔄 Quick deploy...${NC}"
    
    cd ${APP_DIR}
    
    # Pull latest
    git fetch origin
    git reset --hard origin/${BRANCH}
    
    # Install and build
    npm ci --production=false
    npm run build
    
    # Restart PM2
    pm2 restart ${APP_NAME}
    
    echo -e "${GREEN}✅ Quick deploy complete!${NC}"
}

# ============================================
# View logs
# ============================================
logs() {
    pm2 logs ${APP_NAME}
}

# ============================================
# Main Menu
# ============================================
case "${1}" in
    setup)
        setup_system
        ;;
    database)
        setup_database
        ;;
    deploy)
        deploy
        ;;
    nginx)
        setup_nginx
        ;;
    ssl)
        setup_ssl
        ;;
    quick)
        quick_deploy
        ;;
    logs)
        logs
        ;;
    full)
        setup_system
        setup_database
        deploy
        setup_nginx
        ;;
    *)
        echo "Usage: $0 {setup|database|deploy|nginx|ssl|quick|logs|full}"
        echo ""
        echo "Commands:"
        echo "  setup    - Install system dependencies (Node, MySQL, Nginx, PM2)"
        echo "  database - Create MySQL database and run schema"
        echo "  deploy   - Clone repo, build, and start with PM2"
        echo "  nginx    - Configure Nginx reverse proxy"
        echo "  ssl      - Setup SSL with Certbot"
        echo "  quick    - Quick deploy (pull, build, restart)"
        echo "  logs     - View PM2 logs"
        echo "  full     - Run all setup steps"
        exit 1
        ;;
esac

exit 0
