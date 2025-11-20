# AI Platform - Next.js + Supabase

> Nền tảng web hiện đại với quản lý nội dung đầy đủ, tích hợp AI chatbot, và hệ thống quản trị mạnh mẽ.

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)](https://tailwindcss.com/)

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Tech Stack](#-tech-stack)
- [Cài đặt Local](#-cài-đặt-local)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Deploy lên Vercel](#-deploy-lên-vercel)
- [Quản lý Database](#-quản-lý-database)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)

## ✨ Tính năng

### 🌐 Frontend Public
- **Trang chủ động**: Slideshow với Swiper.js, hiển thị bài viết mới nhất
- **Blog system**: Trang bài viết với slug SEO-friendly, hỗ trợ rich content
- **AI Chatbot**: Giao diện chat tương tác với AI, lưu lịch sử hội thoại
- **Responsive design**: Tối ưu cho mọi thiết bị từ mobile đến desktop

### 🔐 Admin Panel
- **Dashboard**: Tổng quan hệ thống với cards điều hướng nhanh
- **Quản lý bài viết**: CRUD đầy đủ với CKEditor, upload ảnh, quản lý trạng thái
- **Quản lý slides**: Drag & drop reorder, upload ảnh, toggle hiển thị
- **Thư viện ảnh**: Quản lý media trên Supabase Storage, tìm kiếm, xóa
- **Quản lý người dùng**: Phân quyền admin/user, tạo/xóa tài khoản
- **Cài đặt website**: Cấu hình logo, title, description, contact info

### 🔒 Authentication & Security
- **Supabase Auth**: Đăng nhập/đăng ký với email + password
- **Row Level Security (RLS)**: Bảo mật cấp database row
- **Protected Routes**: Middleware kiểm tra quyền truy cập
- **Session Management**: Tự động refresh token

### 📦 Storage & Media
- **Supabase Storage**: Lưu trữ ảnh với buckets tổ chức
- **Image optimization**: Next.js Image với lazy loading
- **Multi-upload**: Upload nhiều ảnh cùng lúc
- **Image library**: Browser + select ảnh từ thư viện

## 🛠 Tech Stack

### Core
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3 + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

### Libraries
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: React Hook Form
- **Editor**: CKEditor 5
- **Slider**: Swiper.js
- **Icons**: Lucide React, Tabler Icons
- **Date**: date-fns
- **HTTP**: Native Fetch API

### Development
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier (optional)
- **Deployment**: Vercel

## 🚀 Cài đặt Local

### Prerequisites
- Node.js 18+ và npm
- Tài khoản Supabase (miễn phí)
- Git

### Bước 1: Clone Repository

```bash
git clone https://github.com/nvtin1104/web-ai.git
cd web-ai/client
```

### Bước 2: Cài đặt Dependencies

```bash
npm install
```

### Bước 3: Setup Supabase

1. **Tạo project mới** tại [supabase.com](https://supabase.com)

2. **Lấy credentials**:
   - Vào `Settings` → `API`
   - Copy `Project URL` và `anon public key`
   - Copy `service_role key` (giữ bí mật)

3. **Tạo Storage Bucket**:
   - Vào `Storage` → Create bucket `images`
   - Set public: `true`
   - Allowed MIME types: `image/*`

4. **Tạo file `.env.local`**:

Copy từ `.example.env` và điền các giá trị:

```bash
cp .example.env .env.local
```

Hoặc tạo file `.env.local` với nội dung:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin display name (dùng cho init-admin script)
ADMIN_NAME=Administrator

# Bizino AI Configuration (optional)
NEXT_PUBLIC_BIZINO_API=https://chat.bizino.ai/api
NEXT_PUBLIC_BIZINO_BOT_UUID=your-bot-uuid-here
```

**Giải thích các biến**:
- `NEXT_PUBLIC_SUPABASE_URL`: URL của Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key từ Supabase
- `ADMIN_NAME`: Tên hiển thị mặc định cho admin khi chạy script khởi tạo
- `NEXT_PUBLIC_BIZINO_API`: Endpoint Bizino AI (nếu dùng chatbot Bizino)
- `NEXT_PUBLIC_BIZINO_BOT_UUID`: Bot UUID từ Bizino (tuỳ chọn)

**Lưu ý bảo mật**:
- ⚠️ Không commit file `.env.local` vào Git

### Bước 4: Setup Database

Xem hướng dẫn chi tiết trong [docs/MIGRATE.md](./MIGRATE.md)

1. **Vào Supabase SQL Editor**

2. **Chạy migrations theo thứ tự**:
   ```sql
   -- File: supabase/migrations/001_create_user_table.sql
   -- Copy và paste vào SQL Editor, Execute
   
   -- File: supabase/migrations/002_create_post_table.sql
   -- Execute
   
   -- File: supabase/migrations/003_create_siteinfo_table.sql
   -- Execute
   
   -- File: supabase/migrations/004_create_slides_table.sql
   -- Execute
   ```

3. **Hoặc sử dụng Supabase CLI** (nếu đã cài):
   ```bash
   supabase db push
   ```

### Bước 5: Tạo Admin User

```bash
npm run init-admin
```

Script này sẽ:
- Tạo user với email/password từ `.env.local`
- Set role = `admin`
- Insert vào bảng `User`

### Bước 6: Khởi chạy Development Server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

**Login admin**:
- Email: `admin@example.com` (hoặc giá trị trong `.env.local`)
- Password: `admin123456`

## 📁 Cấu trúc dự án

```
client/
├── app/
│   ├── api/                    # API Routes (Next.js Route Handlers)
│   │   ├── admin/
│   │   │   ├── images/         # Media library API
│   │   │   ├── posts/          # Posts CRUD API
│   │   │   ├── slides/         # Slides CRUD API
│   │   │   ├── site-info/      # Site settings API
│   │   │   ├── upload/         # Upload handler
│   │   │   └── users/          # Users management API
│   │   ├── auth/
│   │   │   └── [...nextauth]/  # Auth callback
│   │   └── public/
│   │       ├── chat/           # Chat API
│   │       ├── posts/          # Public posts API
│   │       ├── slides/         # Public slides API
│   │       └── site-info/      # Public site info API
│   ├── admin/                  # Admin Pages (Protected)
│   │   ├── layout.tsx          # Admin layout with sidebar
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── media/              # Media library page
│   │   ├── posts/              # Posts management pages
│   │   ├── slides/             # Slides management page
│   │   ├── settings/           # Site settings page
│   │   └── users/              # Users management page
│   ├── bai-viet/               # Public blog pages
│   │   ├── page.tsx            # Posts list
│   │   └── [slug]/             # Post detail
│   ├── tro-chuyen/             # Chat page
│   ├── login/                  # Login page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Global styles
│   └── not-found.tsx           # 404 page
├── components/
│   ├── admin/                  # Admin components
│   │   ├── app-sidebar.tsx     # Sidebar navigation
│   │   ├── data-table.tsx      # Reusable data table
│   │   └── ...
│   ├── editor/                 # Editor components
│   │   ├── ckeditor.tsx        # CKEditor wrapper
│   │   └── image-upload.tsx    # Image uploader
│   ├── layout/                 # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── Banner.tsx
│   ├── ChatBar.tsx
│   ├── PostCard.tsx
│   ├── SlideShow.tsx          # Swiper slideshow
│   └── Providers.tsx
├── lib/
│   ├── supabase.ts            # Supabase clients (browser, server, admin)
│   ├── auth-supabase.ts       # Auth helpers
│   ├── db.ts                  # Database functions (CRUD)
│   ├── image-utils.ts         # Image URL helpers
│   ├── storage-utils.ts       # Storage helpers
│   ├── posts.ts               # Post-related helpers
│   ├── site-info.ts           # Site info helpers
│   └── utils.ts               # General utilities
├── hooks/
│   ├── useSupabaseSession.ts  # Session hook
│   └── use-mobile.ts          # Mobile detection
├── types/
│   └── index.ts               # TypeScript types
├── supabase/
│   └── migrations/            # SQL migration files
│       ├── 001_create_user_table.sql
│       ├── 002_create_post_table.sql
│       ├── 003_create_siteinfo_table.sql
│       └── 004_create_slides_table.sql
├── scripts/
│   ├── init-admin.ts          # Create admin user
│   └── migrate-db.ts          # Show migration SQL
├── public/                    # Static files
├── docs/                      # Documentation
│   ├── README.md              # This file
│   └── MIGRATE.md             # Migration guide
├── next.config.ts             # Next.js config
├── tailwind.config.ts         # Tailwind config
├── tsconfig.json              # TypeScript config
├── components.json            # shadcn/ui config
├── package.json
└── .env.local                 # Environment variables (git-ignored)
```

## 🌍 Deploy lên Vercel

### Bước 1: Chuẩn bị Repository

1. **Push code lên GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Đảm bảo các file cần thiết**:
   - ✅ `next.config.ts`
   - ✅ `package.json`
   - ✅ `.gitignore` (đã ignore `.env.local`)
   - ✅ `vercel.json` (nếu có custom config)

### Bước 2: Setup Vercel Project

1. **Đăng nhập Vercel**: [vercel.com](https://vercel.com)

2. **Import Project**:
   - Click `Add New` → `Project`
   - Chọn GitHub repository
   - Select `web-ai` repository

3. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `client` (quan trọng!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Bước 3: Setup Environment Variables

Trong Vercel Dashboard, vào `Settings` → `Environment Variables`, thêm:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin display name
ADMIN_NAME=Administrator

# Bizino AI Configuration (optional)
NEXT_PUBLIC_BIZINO_API=https://chat.bizino.ai/api
NEXT_PUBLIC_BIZINO_BOT_UUID=your-production-bot-uuid
```

**Hướng dẫn setup từng biến**:

1. **Supabase Variables**:
   - Copy từ Supabase Dashboard → Settings → API
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project API keys → anon public

2. **ADMIN_NAME**:
   - Tên hiển thị mặc định cho tài khoản admin khi chạy script `init-admin`

3. **Bizino AI** (Optional):
   - Chỉ cần nếu sử dụng Bizino AI chatbot
   - Lấy `BOT_UUID` từ Bizino Dashboard

**Environments trong Vercel**:
- ✅ **Production**: Dùng cho deployment chính (main branch)
- ✅ **Preview**: Dùng cho pull requests và branch preview
- ✅ **Development**: Dùng cho `vercel dev` local

Set tất cả biến cho cả 3 environments, có thể dùng giá trị khác nhau.

**Lưu ý bảo mật**:
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` bypass RLS, chỉ dùng server-side
- ⚠️ `NEXTAUTH_SECRET` phải unique và secure cho production
- ⚠️ Các biến `NEXT_PUBLIC_*` sẽ được expose ra client (public)
- ⚠️ Không hardcode secrets trong code

### Bước 4: Deploy

1. **Click Deploy** → Vercel sẽ:
   - Clone repository
   - Install dependencies
   - Build Next.js app
   - Deploy lên CDN global

2. **Đợi deploy hoàn tất** (~2-5 phút)

3. **Kiểm tra deployment**:
   - Vào `Deployments` tab
   - Click vào deployment mới nhất
   - Click `Visit` để mở site

### Bước 5: Setup Database trên Production

1. **Chạy migrations** (nếu chưa):
   - Vào Supabase Dashboard
   - SQL Editor → Execute các file migration

2. **Tạo Admin User**:
   
   **Option A: Sử dụng Supabase Dashboard**
   ```sql
   -- Execute trong SQL Editor
   INSERT INTO "User" (id, email, name, role)
   VALUES (
     'admin-user-id-here',
     'admin@yourdomain.com',
     'Administrator',
     'admin'
   );
   ```

   **Option B: Chạy script local** (connect tới production DB):
   ```bash
   # Tạm set env variables cho production
   export NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-key"
   export ADMIN_EMAIL="admin@yourdomain.com"
   export ADMIN_PASSWORD="SecurePassword123!"
   export ADMIN_NAME="Administrator"
   
   npm run init-admin
   ```

3. **Seed dữ liệu mẫu** (optional):
   - Tạo SiteInfo entry
   - Upload ảnh vào Storage bucket `images`
   - Tạo vài bài viết và slides mẫu

### Bước 6: Cấu hình Domain (Optional)

1. **Thêm Custom Domain**:
   - Vercel Dashboard → `Settings` → `Domains`
   - Add domain: `yourdomain.com`

2. **Setup DNS**:
   - Thêm CNAME record trỏ tới Vercel
   - `CNAME yourdomain.com cname.vercel-dns.com`

3. **Update Environment Variable**:
   - `NEXT_PUBLIC_BASE_URL=https://yourdomain.com`
   - Redeploy để apply

### Deploy Checklist

- ✅ Repository pushed to GitHub
- ✅ Vercel project created với root directory = `client`
- ✅ Environment variables configured
- ✅ Supabase database migrated
- ✅ Admin user created
- ✅ Storage bucket `images` created và public
- ✅ RLS policies enabled
- ✅ First deployment successful
- ✅ Site accessible at Vercel URL
- ✅ Admin login working
- ✅ Image upload working

## 🗄 Quản lý Database

### Tables Schema

**User Table**
```sql
CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Post Table**
```sql
CREATE TABLE "Post" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT,
  cover_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id UUID REFERENCES "User"(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**SiteInfo Table**
```sql
CREATE TABLE "SiteInfo" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Slides Table**
```sql
CREATE TABLE "Slides" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  link TEXT,
  "order" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Backup & Restore

**Backup**:
```bash
# Sử dụng Supabase CLI
supabase db dump -f backup.sql

# Hoặc pg_dump
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

**Restore**:
```bash
psql -h db.xxxxx.supabase.co -U postgres -d postgres < backup.sql
```

## 📚 API Documentation

### Public APIs

**GET /public/posts**
- Lấy danh sách bài viết published
- Query: `?limit=10&offset=0`

**GET /public/posts/[slug]**
- Lấy chi tiết bài viết theo slug

**GET /public/slides**
- Lấy slides active

**GET /public/site-info**
- Lấy thông tin website

**POST /public/chat**
- Chat với AI
- Body: `{ message: string, conversationId?: string }`

### Admin APIs (Protected)

**GET /admin/posts**
- Lấy tất cả bài viết (kể cả draft)

**POST /admin/posts**
- Tạo bài viết mới
- Body: `{ title, slug, content, coverImage, status }`

**PUT /admin/posts/[id]**
- Update bài viết

**DELETE /admin/posts/[id]**
- Xóa bài viết

**GET /admin/images**
- Lấy danh sách ảnh từ Storage
- Query: `?bucket=images&prefix=posts&limit=100`

**DELETE /admin/images/delete**
- Xóa ảnh từ Storage
- Query: `?bucket=images&path=posts/image.jpg`

**POST /admin/upload**
- Upload ảnh lên Storage
- FormData: `file`, `bucket`, `folder`

## 🔧 Troubleshooting

### Build Failed trên Vercel

**Lỗi**: `Module not found: Can't resolve '@/components/...'`

**Giải pháp**:
- Kiểm tra `tsconfig.json` có paths mapping
- Đảm bảo imports sử dụng `@/` prefix
- Clear cache: `rm -rf .next node_modules && npm install`

### Database Connection Error

**Lỗi**: `Failed to fetch from Supabase`

**Giải pháp**:
- Check `NEXT_PUBLIC_SUPABASE_URL` đúng format
- Verify `SUPABASE_SERVICE_ROLE_KEY` chính xác
- Kiểm tra RLS policies đã enable
- Check network/firewall không block Supabase

### Image Upload Failed

**Lỗi**: `Upload failed: 403 Forbidden`

**Giải pháp**:
- Kiểm tra Storage bucket `images` đã tạo
- Set bucket public = `true`
- Check RLS policies cho Storage
- Verify `SUPABASE_SERVICE_ROLE_KEY` có quyền

### Admin Can't Login

**Lỗi**: `Invalid credentials`

**Giải pháp**:
- Verify admin user exists trong `User` table
- Check email/password đúng
- Kiểm tra role = `admin`
- Try reset password qua Supabase Auth

### Slides không hiển thị

**Giải pháp**:
- Check có slides với `active = true`
- Verify images đã upload
- Check console logs for errors
- Kiểm tra RLS policies cho `Slides` table

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server (port 3000)
npm run build        # Build production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run init-admin   # Create admin user
npm run migrate      # Show migration SQL

# Utilities
npm run type-check   # TypeScript type checking
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙋 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/nvtin1104/web-ai/issues)
- **Email**: admin@yourdomain.com

---

Made with ❤️ using Next.js and Supabase

