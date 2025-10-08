# Next.js App Router Optimizations

## 🚀 What's Been Implemented

### 1. ✅ API Route Handlers (Server-Side Logic)

Created API routes for secure server-side data fetching:

**Location:** `/src/app/api/`

- **`/api/blogs`** - Fetch all published blogs with pagination
  ```typescript
  GET /api/blogs?page=1&limit=10
  ```

- **`/api/blogs/[slug]`** - Fetch individual blog post
  ```typescript
  GET /api/blogs/my-blog-post
  ```

- **`/api/events`** - Fetch events (all or upcoming only)
  ```typescript
  GET /api/events?upcoming=true
  ```

- **`/api/artists`** - Fetch artists (all or featured only)
  ```typescript
  GET /api/artists?featured=true
  ```

**Benefits:**
- ✅ Server-side data fetching
- ✅ Secure Supabase keys (never exposed to client)
- ✅ Can add caching, rate limiting, authentication
- ✅ Edge-ready (can deploy to Vercel Edge Functions)

### 2. ✅ Server Actions (Form Submissions)

Created type-safe server actions for form handling:

**Location:** `/src/app/actions/`

#### **Invite Form Action**
```typescript
// src/app/actions/invite.ts
import { submitInviteForm } from '@/app/actions/invite'

// In your component:
<form action={submitInviteForm}>
  <input name="name" required />
  <input name="email" type="email" required />
  <button type="submit">Submit</button>
</form>
```

#### **Authentication Actions**
```typescript
// src/app/actions/auth.ts
import { loginArtist, signupArtist, logoutArtist } from '@/app/actions/auth'

// Login
const result = await loginArtist(formData)
if (result.success) {
  router.push(result.redirect)
}

// Signup
const result = await signupArtist(formData)

// Logout
const result = await logoutArtist()
```

**Benefits:**
- ✅ Type-safe with Zod validation
- ✅ Runs on server (secure)
- ✅ No API routes needed for simple forms
- ✅ Progressive enhancement (works without JS)
- ✅ Built-in CSRF protection

### 3. ✅ Server Components with ISR

Created server components that fetch data on the server with Incremental Static Regeneration:

**Example: Blog with ISR**
```typescript
// src/app/blog-server/page.tsx (Server Component)
export const revalidate = 3600 // Revalidate every hour

export default async function BlogServerPage() {
  const { blogs } = await getPublishedBlogs(1, 100)
  return <BlogClient initialBlogs={blogs} />
}
```

**Example: Events with ISR**
```typescript
// src/app/events-server/page.tsx (Server Component)
export const revalidate = 600 // Revalidate every 10 minutes

export default async function EventsServerPage() {
  const projects = await getOurWorkProjects()
  return <EventsClient initialEvents={projects} />
}
```

**Benefits:**
- ✅ Data fetched on server (faster, more secure)
- ✅ Automatic caching with ISR
- ✅ Reduced client-side JavaScript
- ✅ Better SEO (content in initial HTML)
- ✅ Passes initial data to client component for interactivity

### 4. 📊 Pattern: Server Component + Client Component

The optimal pattern for this app:

```
Server Component (page.tsx)
  ├── Fetches data on server
  ├── Has ISR revalidation
  ├── SEO-friendly metadata
  └── Passes data to...
      
Client Component (ClientComponent.tsx)
  ├── 'use client' directive
  ├── Receives initialData as prop
  ├── Interactive features (animations, state)
  └── Can fetch more data client-side
```

**Example Usage:**
```typescript
// ✅ Server Component (SEO + Performance)
export default async function Page() {
  const data = await fetchData() // Runs on server
  return <ClientComponent initialData={data} />
}

// ✅ Client Component (Interactivity)
'use client'
export default function ClientComponent({ initialData }) {
  const [data, setData] = useState(initialData)
  // Interactive features here
}
```

## 🎯 How to Use These Optimizations

### Option 1: Use API Routes (Current Pages)

Keep current client-side pages, but fetch from API routes:

```typescript
'use client'

export default function MyPage() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => setData(data.blogs))
  }, [])
  
  return <div>{/* render data */}</div>
}
```

### Option 2: Use Server Components (Recommended)

Replace client pages with server components + client wrappers:

```typescript
// page.tsx (Server Component)
export const revalidate = 3600

export default async function Page() {
  const data = await fetchData()
  return <PageClient initialData={data} />
}

// PageClient.tsx
'use client'
export default function PageClient({ initialData }) {
  // Your interactive code here
}
```

### Option 3: Use Server Actions for Forms

Replace form handlers with server actions:

```typescript
// actions/myaction.ts
'use server'

export async function submitForm(formData: FormData) {
  // Validate and process on server
  return { success: true }
}

// MyForm.tsx
'use client'
import { submitForm } from '@/app/actions/myaction'

export default function MyForm() {
  async function handleSubmit(formData: FormData) {
    const result = await submitForm(formData)
    if (result.success) {
      // Handle success
    }
  }
  
  return <form action={handleSubmit}>...</form>
}
```

## 📈 Migration Path

### Current State
- ✅ All pages are client components ('use client')
- ✅ Data fetched client-side with React Query
- ✅ Forms handled client-side

### Gradual Migration

1. **Start with static content:**
   - `/blog` → `/blog-server` (already created)
   - `/events` → `/events-server` (already created)
   - `/about` → `/about-server` (could be fully static)

2. **Add ISR to dynamic pages:**
   - `/events/[slug]` - Add `export const revalidate = 3600`
   - `/blog/[slug]` - Add `export const revalidate = 3600`
   - `/artists/[slug]` - Add `export const revalidate = 1800`

3. **Convert forms to Server Actions:**
   - Replace InviteForm client logic with Server Action
   - Replace ArtistLogin/Signup with Server Actions
   - Add admin forms as Server Actions

4. **Use API routes for sensitive operations:**
   - Admin operations
   - Payment processing
   - Email sending

## 🔄 About the `/src` Directory

**Q: Why are we using `/src`?**

**A: It's a valid Next.js pattern!** Next.js supports both:
- `/app` (root level)
- `/src/app` (with src directory)

**Benefits of `/src`:**
- ✅ Cleaner root directory (configs stay at root, code in `/src`)
- ✅ Better organization for large projects
- ✅ Familiar to developers from CRA, Vite
- ✅ Officially supported by Next.js

**If you prefer `/app`:**
You can move everything from `/src/app` to `/app` - it's just a preference!

```bash
# To move to root /app (optional):
mv src/app ./app
mv src/components ./components
mv src/lib ./lib
# Update imports in tsconfig.json paths
```

## 🎯 Recommended Next Steps

### High Priority
1. ✅ **Use the server component examples** - Copy the pattern for other pages
2. ✅ **Implement Server Actions** - Replace client-side form handlers
3. ✅ **Add API routes for admin** - Secure operations on the server

### Medium Priority
4. **Add metadata to all pages** - Better SEO
5. **Implement OpenGraph images** - Social media previews
6. **Add route handlers for webhooks** - Payment, email confirmations

### Low Priority (Future)
7. **Streaming with Suspense** - Faster page loads
8. **Parallel Routes** - Complex layouts
9. **Intercepting Routes** - Modal routing

## 📚 Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [ISR](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)

## 🎉 Summary

You now have:
- ✅ Full Next.js App Router structure
- ✅ API routes for server-side logic
- ✅ Server Actions for form submissions
- ✅ Server Components with ISR examples
- ✅ Optimal rendering patterns

The foundation is solid! You can gradually adopt these optimizations as needed. Start with the server component examples (`/blog-server`, `/events-server`) and apply the pattern to other pages.
