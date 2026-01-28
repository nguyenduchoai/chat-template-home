# Chat Template Home - Self-Hosted VPS Deployment

> Nền tảng web hiện đại với quản lý nội dung, AI chatbot, và hệ thống quản trị - Deploy trên VPS riêng.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://mysql.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Tech Stack](#-tech-stack)
- [Deploy trên VPS với aaPanel](#-deploy-trên-vps-với-aapanel)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)

## ✨ Tính năng

### 🌐 Frontend Public
- **Trang chủ động**: Slideshow với Swiper.js, hiển thị bài viết mới nhất
- **Blog system**: Trang bài viết với slug SEO-friendly, hỗ trợ rich content
- **AI Chatbot**: Giao diện chat tương tác với AI
- **Responsive design**: Tối ưu cho mọi thiết bị

### 🔐 Admin Panel
- **Dashboard**: Tổng quan hệ thống
- **Quản lý bài viết**: CRUD với CKEditor, upload ảnh
- **Quản lý slides**: Drag & drop reorder
- **Thư viện ảnh**: Quản lý ảnh local
- **Quản lý người dùng**: Phân quyền admin/user
- **Cài đặt website**: Logo, title, description, contact

### 🔒 Authentication & Security
- **JWT Authentication**: Đăng nhập bảo mật với JWT token
- **Protected Routes**: Middleware kiểm tra quyền truy cập
- **Session Management**: Cookie-based sessions

### 📦 Storage & Media
- **Local Storage**: Ảnh lưu tại `/public/uploads/`
- **Image optimization**: Next.js Image với lazy loading
- **Multi-upload**: Upload nhiều ảnh cùng lúc

## 🛠 Tech Stack

### Core
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: MySQL 8
- **Authentication**: JWT (jose library)
- **Storage**: Local filesystem

### Libraries
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: React Hook Form
- **Editor**: CKEditor 5
- **Slider**: Swiper.js
- **Icons**: Lucide React, Tabler Icons

## 🚀 Deploy trên VPS với aaPanel

### Yêu cầu hệ thống

- VPS với aaPanel đã cài đặt
- Nginx
- Node.js 18+ (quản lý qua aaPanel)
- MySQL 8.0+
- Git

### Bước 1: Chuẩn bị MySQL Database

1. **Vào aaPanel → Databases → Add Database**:
   - Database name: `chat_template`
   - Username: `chat_user`
   - Password: Tạo password mạnh
   - Character set: `utf8mb4`

2. **Import Schema**:
   ```bash
   cd /www/wwwroot/your-domain.com
   mysql -u chat_user -p chat_template < mysql/schema.sql
   ```

### Bước 2: Clone và Setup Project

```bash
# SSH vào VPS
ssh root@your-vps-ip

# Vào thư mục web của aaPanel
cd /www/wwwroot/

# Clone repository
git clone https://github.com/your-repo/chat-template-home.git your-domain.com
cd your-domain.com

# Cài đặt dependencies
npm install

# Copy file env
cp .env.example .env
```

### Bước 3: Cấu hình Environment Variables

Sửa file `.env`:

```env
# ============================================
# Database (MySQL)
# ============================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=chat_user
DB_PASSWORD=your_db_password
DB_NAME=chat_template

# ============================================
# Authentication (JWT)
# ============================================
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-change-this
JWT_EXPIRES_IN=7d

# ============================================
# Admin User (cho init script)
# ============================================
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=SecurePassword123!
ADMIN_NAME=Administrator

# ============================================
# Application
# ============================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# ============================================
# Storage
# ============================================
UPLOAD_DIR=./public/uploads

# ============================================
# Optional: Bizino AI Integration
# ============================================
# NEXT_PUBLIC_IA_ASSISTANT_ID=
# NEXT_PUBLIC_IA_BASE_URL=
# NEXT_PUBLIC_IA_KEY=
```

### Bước 4: Khởi tạo Database và Admin

```bash
# Tạo tài khoản admin
npm run init-admin
```

### Bước 5: Build Production

```bash
# Build app
npm run build
```

### Bước 6: Cấu hình PM2 (Process Manager)

Tạo file `ecosystem.config.js`:

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'chat-template',
    script: 'npm',
    args: 'start',
    cwd: '/www/wwwroot/your-domain.com',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF
```

Chạy với PM2:

```bash
# Cài PM2 toàn cục (nếu chưa có)
npm install -g pm2

# Start app
pm2 start ecosystem.config.js

# Lưu config để auto-start khi reboot
pm2 save
pm2 startup
```

### Bước 7: Cấu hình Nginx (qua aaPanel)

1. **Vào aaPanel → Website → Add Site**:
   - Domain: `yourdomain.com`
   - PHP version: Pure Static

2. **Sửa Nginx Config** (Site → Settings → Config):

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL (aaPanel sẽ tự thêm nếu dùng Let's Encrypt)
    # ssl_certificate /path/to/cert;
    # ssl_certificate_key /path/to/key;

    # Root folder cho uploads
    root /www/wwwroot/your-domain.com/public;
    
    # Serve static uploads directly
    location /uploads/ {
        alias /www/wwwroot/your-domain.com/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Static files from Next.js
    location /_next/static/ {
        alias /www/wwwroot/your-domain.com/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy to Next.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;
    
    # Logs
    access_log /www/wwwlogs/yourdomain.com.log;
    error_log /www/wwwlogs/yourdomain.com.error.log;
}
```

3. **Reload Nginx**:
   ```bash
   nginx -t && nginx -s reload
   ```

### Bước 8: Cấu hình SSL (Let's Encrypt)

Trong aaPanel:
1. Vào **Website → your-domain.com → SSL**
2. Chọn **Let's Encrypt**
3. Click **Apply**
4. Bật **Force HTTPS**

### Bước 9: Kiểm tra Deployment

```bash
# Kiểm tra PM2 status
pm2 status

# Xem logs
pm2 logs chat-template

# Kiểm tra MySQL
mysql -u chat_user -p -e "SELECT COUNT(*) FROM chat_template.User;"
```

Truy cập:
- Website: `https://yourdomain.com`
- Admin: `https://yourdomain.com/admin`
- Login: Dùng email/password đã set trong `.env`

---

## 📜 Scripts hữu ích

### Update từ Git

```bash
cd /www/wwwroot/your-domain.com

# Pull code mới
git pull origin main

# Cài dependencies mới (nếu có)
npm install

# Rebuild
npm run build

# Restart app
pm2 restart chat-template
```

### Tạo script deploy tự động

Tạo file `scripts/deploy-vps.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building production..."
npm run build

# Restart PM2
echo "♻️ Restarting application..."
pm2 restart chat-template

echo "✅ Deployment complete!"
echo "🌐 Visit: https://yourdomain.com"
```

```bash
chmod +x scripts/deploy-vps.sh
```

### Backup Database

```bash
# Backup
mysqldump -u chat_user -p chat_template > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
mysql -u chat_user -p chat_template < backup_file.sql
```

---

## 📁 Cấu trúc thư mục

```
chat-template-home/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── admin/          # Admin APIs (protected)
│   │   ├── auth/           # Authentication APIs
│   │   └── public/         # Public APIs
│   ├── admin/              # Admin Pages
│   ├── bai-viet/           # Blog pages
│   ├── login/              # Login page
│   └── page.tsx            # Homepage
├── components/             # React components
│   ├── admin/              # Admin components
│   ├── editor/             # CKEditor, Image upload
│   ├── layout/             # Header, Footer
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities
│   ├── auth.ts             # JWT authentication
│   ├── db.ts               # Database functions
│   ├── db-mysql.ts         # MySQL connection
│   └── storage.ts          # Local file storage
├── hooks/                  # React hooks
├── mysql/                  # MySQL schema
│   └── schema.sql          # Database schema
├── public/                 # Static files
│   └── uploads/            # User uploaded images
├── scripts/                # Utility scripts
│   ├── init-admin-mysql.ts # Create admin user
│   └── deploy.sh           # Deploy script
├── ecosystem.config.js     # PM2 config
├── package.json
└── .env                    # Environment variables
```

---

## 📚 API Documentation

### Public APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/posts` | Lấy danh sách bài viết |
| GET | `/api/public/posts/[slug]` | Lấy chi tiết bài viết |
| GET | `/api/public/slides` | Lấy slides active |
| GET | `/api/public/site-info` | Lấy thông tin website |
| GET | `/api/public/features` | Lấy danh sách features |
| GET | `/api/public/reasons` | Lấy danh sách reasons |

### Auth APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signin` | Đăng nhập |
| POST | `/api/auth/signout` | Đăng xuất |
| GET | `/api/auth/user` | Lấy thông tin user hiện tại |

### Admin APIs (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/posts` | CRUD bài viết |
| GET/PUT/DELETE | `/api/admin/posts/[id]` | Quản lý bài viết |
| GET/POST | `/api/admin/slides` | CRUD slides |
| POST | `/api/admin/upload/image` | Upload ảnh |
| GET | `/api/admin/images` | Lấy danh sách ảnh |
| DELETE | `/api/admin/images/delete` | Xóa ảnh |

---

## 🔧 Troubleshooting

### App không start được

```bash
# Kiểm tra PM2 logs
pm2 logs chat-template --lines 50

# Kiểm tra port 3000
netstat -tlnp | grep 3000

# Restart
pm2 restart chat-template
```

### Lỗi kết nối MySQL

```bash
# Kiểm tra MySQL chạy chưa
systemctl status mysql

# Test connection
mysql -u chat_user -p -e "SELECT 1;"

# Kiểm tra database
mysql -u chat_user -p -e "SHOW DATABASES;"
```

### Upload ảnh không hoạt động

```bash
# Kiểm tra quyền thư mục uploads
ls -la public/uploads/

# Cấp quyền
chmod -R 755 public/uploads/
chown -R www:www public/uploads/
```

### Nginx 502 Bad Gateway

```bash
# Kiểm tra PM2 app đang chạy
pm2 status

# Kiểm tra port
curl http://localhost:3000

# Xem Nginx error log
tail -f /www/wwwlogs/yourdomain.com.error.log
```

### Build failed

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 📞 Liên hệ

Nếu gặp vấn đề, liên hệ:
- Email: support@yourdomain.com
- GitHub Issues: [Link to issues]

---

**Deploy successful! 🚀**
