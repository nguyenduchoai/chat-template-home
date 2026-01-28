# PRD: Migrate from Supabase to MySQL + VPS

> **Created**: 2026-01-28  
> **Status**: Planning → In Progress  
> **Estimated Effort**: 8-12 hours  
> **Priority**: High

---

## 📋 Executive Summary

Migrate the chat-template-home project from:
- **Supabase** (PostgreSQL + Auth + Storage) 
- **Vercel** (Hosting)

To:
- **MySQL** (Database)
- **Cookie-based Auth with JWT** (Authentication)
- **Local File Storage** (Image uploads)
- **VPS** (Self-hosted with PM2 + Nginx)

---

## 🎯 Goals

1. Remove all Supabase dependencies
2. Implement MySQL with mysql2 + connection pooling
3. Implement JWT-based authentication with HttpOnly cookies
4. Implement local file storage for uploads
5. Create production deployment scripts for VPS
6. Maintain all existing functionality

---

## 📊 Current Architecture Analysis

### Database Tables (8 total)
| Table | Fields | Notes |
|-------|--------|-------|
| User | id, email, name, password, image, role, emailVerified, createdAt, updatedAt | Primary table |
| Post | id, title, slug, content, excerpt, coverImage, published, authorId, createdAt, updatedAt, publishedAt | FK to User |
| SiteInfo | id, siteUrl, title, name, logo, description, keywords, bannerTitle, bannerDescription, etc. | Single row |
| Slides | id, title, image, link, order, active, created_at, updated_at | |
| Features | id, icon, title, description, order, active, created_at, updated_at | |
| Reasons | id, icon, title, description, order, active, created_at, updated_at | |
| ColorConfig | id, key, value, rgbValue, description, createdAt, updatedAt | |
| Contact | id, name, email, phone, subject, message, read, createdAt, updatedAt | |

### Authentication Flow
- Current: Supabase Auth (email/password → session cookie)
- Target: JWT in HttpOnly cookie

### Files to Modify
| Category | Files |
|----------|-------|
| Database Layer | lib/db.ts, lib/supabase.ts |
| Auth Layer | lib/auth-supabase.ts, app/api/auth/* |
| Storage Layer | lib/supabase-storage.ts, lib/storage-utils.ts |
| Client Hooks | hooks/useSupabaseSession.ts |
| Components | components/layout/Header.tsx, components/admin/*, components/editor/* |
| Scripts | scripts/init-admin.ts, scripts/migrate-db.ts |
| Config | next.config.ts, package.json |

---

## 🏗️ Technical Design

### Phase 1: Database Layer (MySQL)
```
New Files:
├── lib/mysql.ts           # MySQL connection pool
├── lib/db-mysql.ts        # All CRUD operations
└── mysql/
    └── schema.sql         # MySQL schema
```

**Tech Stack:**
- `mysql2` - MySQL driver with connection pooling
- Prepared statements for SQL injection prevention

### Phase 2: Authentication (JWT + Cookies)
```
New/Modified Files:
├── lib/auth.ts            # JWT utilities (sign, verify)
├── lib/session.ts         # Session management
├── app/api/auth/signin/route.ts  # Login
├── app/api/auth/signout/route.ts # Logout
└── app/api/auth/user/route.ts    # Get current user
```

**Tech Stack:**
- `jose` - JWT library (lightweight, edge-compatible)
- `bcryptjs` - Password hashing (already installed)
- HttpOnly cookies for session

### Phase 3: File Storage (Local)
```
New Files:
├── lib/storage.ts         # Local file storage utilities
├── public/uploads/        # Upload directory
└── app/api/upload/route.ts # Upload API
```

### Phase 4: VPS Deployment
```
New Files:
├── ecosystem.config.js    # PM2 configuration
├── scripts/deploy.sh      # Deployment script
├── nginx/                 # Nginx config template
└── .env.production        # Production env template
```

---

## 📝 Implementation Phases

### Phase 1: MySQL Setup (2-3 hours)
- [ ] Install mysql2
- [ ] Create lib/mysql.ts with connection pool
- [ ] Create mysql/schema.sql
- [ ] Migrate all CRUD operations from Supabase to MySQL
- [ ] Remove Supabase database calls

### Phase 2: Authentication (2-3 hours)
- [ ] Install jose
- [ ] Create lib/auth.ts with JWT utilities
- [ ] Modify signin/signout/user API routes
- [ ] Update useSupabaseSession → useSession hook
- [ ] Remove Supabase auth dependencies

### Phase 3: File Storage (1-2 hours)
- [ ] Create lib/storage.ts for local uploads
- [ ] Modify image upload components
- [ ] Create uploads directory structure
- [ ] Migrate existing storage utilities

### Phase 4: VPS Deployment (2-3 hours)
- [ ] Create PM2 ecosystem.config.js
- [ ] Create Nginx config template
- [ ] Create deploy.sh script
- [ ] Update .env.production template
- [ ] Remove Vercel config

### Phase 5: Cleanup (1 hour)
- [ ] Remove Supabase packages
- [ ] Remove unused files
- [ ] Update documentation
- [ ] Test all functionality

---

## ⚙️ Environment Variables (New)

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=chat_template

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password

# Storage
UPLOAD_DIR=./public/uploads

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 🚀 VPS Requirements

- **OS**: Ubuntu 20.04+ / Debian 11+
- **Node.js**: 18+ (LTS)
- **MySQL**: 8.0+
- **Nginx**: Latest
- **PM2**: Process manager
- **RAM**: 1GB minimum
- **Storage**: 20GB minimum

---

## ✅ Success Criteria

1. All existing functionality works
2. Authentication secure (JWT in HttpOnly cookies)
3. Database queries optimized (connection pooling)
4. Images upload to local storage
5. Deployment automated with single command
6. Zero Supabase dependencies

---

## ⚠️ Breaking Changes

1. Environment variables renamed
2. Authentication flow changed (session cookies)
3. Image URLs changed (local paths)
4. Deployment target changed (VPS vs Vercel)

---

*Ready to implement? User chose: **5️⃣ FIX ALL***
