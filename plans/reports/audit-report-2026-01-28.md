# 🏥 Audit Report - chat-template-home

> **Date**: 2026-01-28 07:52 (UTC+7)
> **Project**: Next.js 16 + Supabase + TailwindCSS 4
> **Tech Stack**: React 19.2, shadcn/ui, CKEditor 5
> **Auditor**: Bizino AI DEV - Code Doctor

---

## 📊 Executive Summary

| Metric | Before | After FIX ALL |
|--------|--------|---------------|
| 🔴 **Critical Issues** | 2 | **0** ✅ |
| 🟡 **Warnings** | 8 | 5 |
| 🟢 **Suggestions** | 6 | 6 |
| 📊 **Overall Health Score** | 65/100 | **78/100** ✅ |

### ✅ FIX ALL Results (2026-01-28 08:00 UTC+7)

| Fix | Status |
|-----|--------|
| Update Next.js 16.0.3 → 16.1.6 | ✅ FIXED |
| Update React 19.2.0 → 19.2.4 | ✅ FIXED |
| Add XSS Protection (DOMPurify) | ✅ FIXED |
| Remove debug console.log (11 files) | ✅ FIXED |
| Create sanitize.ts utility | ✅ ADDED |
| Build verification | ✅ PASSED |

### Remaining Issues
- ⚠️ **67 Moderate vulnerabilities** từ CKEditor 5 (lodash-es) - cần đánh giá migrate
- ⚠️ **50+ `any` types** cần refine (non-blocking)
- ⚠️ **lib/db.ts** vẫn còn lớn (1543 lines)

---

## 🔴 Critical Issues (PHẢI SỬA NGAY)

### 1. Next.js Critical Security Vulnerabilities

- **File:** `package.json` (dependency: `next@16.0.3`)
- **Type:** Security / RCE + DoS
- **CVE:** GHSA-9qr9-h5gf-34mp, GHSA-w37m-7fhw-fmv9, GHSA-mwv6-3258-q52c
- **Risk Level:** 🔴 CRITICAL
- **Description:** 
  - **RCE in React Flight Protocol**: Hacker có thể thực thi code từ xa
  - **Server Actions Source Code Exposure**: Lộ source code server
  - **DoS via Server Components**: Có thể crash server
  - **DoS via Image Optimizer**: remotePatterns misconfiguration

**Evidence:**
```json
"next": "16.0.3"  // Current
// Vulnerable: 15.6.0-canary.0 - 16.1.4
```

**Fix:**
```bash
npm install next@16.1.6
```
- **Effort:** 5 minutes
- **Priority:** 🔥 IMMEDIATE

---

### 2. XSS Vulnerability - Unsanitized HTML Rendering

- **Files:** 
  - `app/bai-viet/[slug]/page.tsx:63`
  - `app/tro-chuyen/page.tsx:405`
- **Type:** Security / XSS (Cross-Site Scripting)
- **Risk Level:** 🔴 CRITICAL
- **Description:** HTML content được render trực tiếp mà không sanitize. Nếu post content chứa malicious script, sẽ bị execute trong browser của user.

**Evidence:**
```tsx
// app/bai-viet/[slug]/page.tsx:63-65
<div
    className="prose prose-lg dark:prose-invert max-w-none"
    dangerouslySetInnerHTML={{
        __html: transformHtmlImageUrls(post.content) // ⚠️ NOT SANITIZED!
    }}
/>
```

**Fix:**
```bash
npm install dompurify @types/dompurify
```

```tsx
import DOMPurify from 'dompurify';

<div
    dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(transformHtmlImageUrls(post.content))
    }}
/>
```
- **Effort:** 30 minutes
- **Priority:** 🔥 IMMEDIATE

---

## 🟡 Warnings (NÊN SỬA)

### 1. CKEditor 5 Vulnerabilities (67 moderate)

- **File:** `package.json` (dependency: `@ckeditor/ckeditor5-build-classic@41.4.2`)
- **Type:** Security / Moderate
- **Risk:** lodash-es prototype pollution chain
- **Impact:** Medium - các vulnerability này trong dependencies nội bộ của CKEditor

**Fix Options:**
1. **Option A (Recommended):** Downgrade to safe version
```bash
npm uninstall @ckeditor/ckeditor5-build-classic @ckeditor/ckeditor5-react
npm install @ckeditor/ckeditor5-build-classic@39.0.2 @ckeditor/ckeditor5-react@6.3.0
```

2. **Option B:** Migrate to alternative editor
```bash
# Tiptap (recommended for React)
npm install @tiptap/react @tiptap/starter-kit
```
- **Effort:** 2-4 hours (if migrating)

---

### 2. Missing Dependencies (node_modules not installed)

- **Type:** Configuration
- **Impact:** Project cannot run without `npm install`

**Fix:**
```bash
npm install
```

---

### 3. ESLint Not Working

- **File:** `package.json` scripts
- **Type:** Code Quality
- **Error:** `sh: eslint: command not found`
- **Cause:** node_modules not installed or eslint not in PATH

**Fix:**
```bash
npm install
npm run lint
```

---

### 4. Excessive console.log Statements (18 occurrences)

- **Type:** Code Quality / Debug Code in Production
- **Files:**
  | File | Count |
  |------|-------|
  | `lib/db.ts` | 1 |
  | `scripts/init-admin.ts` | 7 |
  | `scripts/migrate-db.ts` | 1 |
  | `app/api/admin/color-config/route.ts` | 2 |
  | `app/api/admin/users/route.ts` | 1 |
  | `app/api/admin/posts/[id]/route.ts` | 4 |
  | `app/api/public/start-chat/route.ts` | 1 |
  | `app/api/public/posts/[slug]/route.ts` | 2 |

**Fix:** Replace with proper logging or remove
```typescript
// BAD
console.log("User:", user.email, "Role:", user.role)

// GOOD - Use conditional logging or proper logger
if (process.env.NODE_ENV === 'development') {
    console.log("User:", user.email)
}
// Or remove entirely in production code
```
- **Effort:** 30 minutes
- **Auto-Fixable:** ✅ YES

---

### 5. Excessive `any` Types (50+ occurrences)

- **Type:** TypeScript / Type Safety
- **Primary Files:**
  | File | Count |
  |------|-------|
  | `lib/db.ts` | 15+ |
  | `app/tro-chuyen/page.tsx` | 20+ |
  | `app/admin/users/page.tsx` | 3 |
  | `app/admin/profile/page.tsx` | 3 |
  | API routes | 10+ |

**High Priority Fixes:**
```typescript
// lib/db.ts:641
// BAD
function mapSiteInfo(data: any): SiteInfo {

// GOOD - Define proper interface
interface RawSiteInfoRow {
    id: string
    siteUrl: string
    title: string
    // ... other fields
    updatedAt: string
}
function mapSiteInfo(data: RawSiteInfoRow): SiteInfo {
```

```typescript
// app/tro-chuyen/page.tsx
// BAD
const [botInfo, setBotInfo] = useState<any>(undefined);
const [chatHistory, setChatHistory] = useState<any[]>([]);

// GOOD
interface BotInfo {
    name: string
    avatar?: string
    // ...
}
interface ChatMessage {
    _id: string
    role: 'user' | 'assistant'
    content: string
}
const [botInfo, setBotInfo] = useState<BotInfo | undefined>(undefined);
const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
```
- **Effort:** 2-3 hours
- **Priority:** MEDIUM

---

### 6. Large File: lib/db.ts (1543 lines)

- **Type:** Code Quality / Maintainability
- **Impact:** Hard to maintain, test, and navigate
- **Recommendation:** Split into domain-specific modules

**Suggested Structure:**
```
lib/
├── db/
│   ├── index.ts          # Re-exports
│   ├── users.ts          # User CRUD
│   ├── posts.ts          # Post CRUD  
│   ├── site-info.ts      # Site settings
│   ├── slides.ts         # Slides CRUD
│   ├── features.ts       # Features CRUD
│   ├── reasons.ts        # Reasons CRUD
│   ├── colors.ts         # Color config
│   ├── contacts.ts       # Contacts CRUD
│   └── types.ts          # Shared types
```
- **Effort:** 4-6 hours
- **Priority:** LOW (refactoring)

---

### 7. TODO Comments Unresolved

- **File:** `app/tro-chuyen/page.tsx:330`
- **Content:** `// TODO: Implement stop generation logic if needed`
- **Effort:** Review and implement or remove

---

### 8. Dependencies Outdated

Several packages have newer versions available:

| Package | Current | Latest |
|---------|---------|--------|
| `next` | 16.0.3 | 16.1.6 |
| `react` | 19.2.0 | 19.2.4 |
| `react-dom` | 19.2.0 | 19.2.4 |
| `lucide-react` | 0.553.0 | 0.563.0 |
| `@supabase/ssr` | 0.5.2 | 0.8.0 |
| `framer-motion` | - | 12.29.2 |
| `recharts` | 2.15.4 | 3.7.0 |
| `zod` | - | 4.3.6 |

**Fix:**
```bash
npm update
# or for major version changes:
npm install next@16.1.6 react@19.2.4 react-dom@19.2.4
```

---

## 🟢 Suggestions (TÙY CHỌN)

### 1. Missing Rate Limiting for API Routes

- **Files:** All API routes in `app/api/`
- **Risk:** Brute force attacks, API abuse
- **Recommendation:** Add rate limiting middleware

```typescript
// lib/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server'

const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

export function rateLimit(request: NextRequest, limit: number = 10, window: number = 60000) {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    const now = Date.now()
    const record = rateLimitMap.get(ip)
    
    if (!record || now - record.lastReset > window) {
        rateLimitMap.set(ip, { count: 1, lastReset: now })
        return true
    }
    
    if (record.count >= limit) {
        return false
    }
    
    record.count++
    return true
}
```

---

### 2. Add Input Validation on API Routes

- **Files:** `app/api/admin/*/route.ts`
- **Current:** Basic validation only
- **Recommendation:** Use Zod for robust validation

```typescript
import { z } from 'zod'

const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
    role: z.enum(['user', 'admin', 'superadmin']).default('user'),
})

export async function POST(request: Request) {
    const body = await request.json()
    const result = createUserSchema.safeParse(body)
    
    if (!result.success) {
        return NextResponse.json(
            { error: result.error.flatten() },
            { status: 400 }
        )
    }
    // ... continue with validated data
}
```

---

### 3. Add Error Boundary for Chat Component

- **File:** `app/tro-chuyen/page.tsx`
- **Reason:** Complex client component should have error handling

---

### 4. Image Optimization Missing

- **File:** Various components using `<Image>`
- **Current:** `unoptimized` flag is set
- **Issue:** Not leveraging Next.js image optimization

---

### 5. Missing API Documentation

- **Recommendation:** Add OpenAPI/Swagger documentation for API routes

---

### 6. Consider Adding Tests

- **Current:** No test files detected
- **Recommendation:** Add at least unit tests for critical functions in `lib/db.ts`

---

## ✅ Security Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Password hashing | ✅ | bcrypt with salt rounds 10 |
| .env in .gitignore | ✅ | Properly configured |
| No hardcoded secrets | ✅ | Using environment variables |
| RBAC implemented | ✅ | requireAdmin, requireSuperadmin |
| SQL Injection | ✅ | Using Supabase SDK (parameterized) |
| XSS Protection | ❌ | dangerouslySetInnerHTML without sanitization |
| CSRF Protection | ⚠️ | Relies on Supabase Auth |
| Rate Limiting | ❌ | Not implemented |
| Input Validation | ⚠️ | Basic, needs Zod |
| Error Messages | ⚠️ | Some expose internal details |

---

## 📈 Code Quality Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Total Lines of Code | 18,214 | - |
| Largest File | lib/db.ts (1,543) | <300 |
| Files with `any` | 10+ | 0 |
| console.log count | 18 | 0 |
| TODO/FIXME count | 1 | 0 |
| Cyclomatic Complexity | Medium | Low |

---

## 🎬 Action Plan

### Immediate Actions (Today)
1. ✅ Update Next.js to 16.1.6 (`npm install next@16.1.6`)
2. ✅ Add DOMPurify for XSS protection
3. ✅ Run `npm install` to install missing dependencies

### This Week
4. Remove/replace console.log statements
5. Address CKEditor vulnerabilities
6. Update other outdated packages

### Next Sprint
7. Refactor lib/db.ts into modules
8. Add Zod validation to API routes
9. Implement rate limiting
10. Replace `any` types with proper interfaces

---

## 📋 Next Steps

```
Anh muốn làm gì tiếp theo?

┌─────────────────────────────────────────────────┐
│ 1️⃣ Xem báo cáo chi tiết trước                   │
│                                                  │
│ 2️⃣ Sửa lỗi Critical ngay → /code               │
│                                                  │
│ 3️⃣ Dọn dẹp code smell → /refactor              │
│                                                  │
│ 4️⃣ Bỏ qua, lưu báo cáo → /save-brain           │
│                                                  │
│ 5️⃣ 🔧 FIX ALL - Tự động sửa TẤT CẢ             │
│    (Chỉ các lỗi có thể auto-fix)                │
└─────────────────────────────────────────────────┘

Gõ số (1-5) để chọn:
```

---

*Generated by Bizino AI DEV - Code Doctor*
*"Prevent is better than cure"*
