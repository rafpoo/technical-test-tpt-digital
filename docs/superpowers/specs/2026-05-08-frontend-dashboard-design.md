# Frontend Dashboard Design — Product Management Admin

**Date:** 2026-05-08  
**Tech Stack:** Vite + React + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query + Axios + Zod

## Overview

Modern admin dashboard for managing products and categories with authentication, CRUD operations, dashboard statistics, and CSV export.

## Architecture

### Technology Choices

**Approach 2: React Query + Axios (Recommended)**
- **Vite + React + TypeScript** — Fast dev, type safety
- **Tailwind CSS + shadcn/ui** — Rapid, consistent UI components
- **TanStack Query (React Query)** — Server state management, caching, loading/error states
- **Axios** — HTTP client with JWT interceptor
- **Zod** — Form validation matching backend Pydantic schemas
- **React Router DOM** — Client-side routing with auth guards

**Why this stack:**
- TanStack Query handles caching for product/category lists beautifully
- Axios interceptors auto-attach JWT token to all requests
- Zod schemas mirror backend Pydantic models for end-to-end type safety
- shadcn/ui provides production-grade components out of the box

## Pages & Components

### 1. Login Page (`/login`)
- Centered card layout with logo/title
- Username/password form (Zod validation)
- On success: store JWT in localStorage, redirect to `/dashboard`
- On error: display toast notification

### 2. Layout — Sidebar (`/`)
- **shadcn/ui Sidebar** component (collapsible)
- **Navigation items:**
  - Dashboard (`/dashboard`)
  - Products (`/products`)
  - Categories (`/categories`)
  - Export CSV button (triggers `/api/reports/products` download)

- **Auth guard:** All routes under `/` require valid JWT
- **Logout button:** Clears JWT, redirects to `/login`

### 3. Dashboard Page (`/dashboard`)
- **Stats cards** (4 cards in grid):
  - Total Products
  - Total Categories  
  - Total Inventory Value ($)
  - Low Stock Products (count)
- **Low Stock Table** (shadcn/ui DataTable):
  - Columns: Name, Description, Price, Category, Stock Quantity
  - Filters: None (pre-filtered for stock < 10)
  - Sorting: By stock quantity (ascending)

### 4. Products Page (`/products`)
- **shadcn/ui DataTable** with:
  - Columns: Name, Description, Price, Category, Stock Quantity, Actions
  - **Filter:** Dropdown to filter by category (`?category_id=`)
  - **Sorting:** By name, price, stock
  - **Actions:** Edit (modal), Delete (confirm dialog)
  - **Create button:** Opens create modal
- **Create/Edit Modal** (shadcn/ui Dialog):
  - Form: Name, Description, Price, Category (dropdown), Stock Quantity
  - Zod validation matching backend `ProductCreate/ProductUpdate`
  - On submit: Invalidate TanStack Query cache

### 5. Categories Page (`/categories`)
- **shadcn/ui DataTable** with:
  - Columns: Name, Description, Created At, Updated At, Actions
  - **Sorting:** By name
  - **Actions:** Edit (modal), Delete (confirm dialog)
  - **Create button:** Opens create modal
- **Create/Edit Modal** (shadcn/ui Dialog):
  - Form: Name, Description
  - Zod validation matching backend `CategoryCreate/CategoryUpdate`
  - On submit: Invalidate TanStack Query cache

## Data Flow

```
User Action → Component → Mutation/Query (TanStack) → Axios (JWT interceptor) → Backend API
                ↓
         On success → Invalidate cache → Refetch → Update UI
                ↓
         On error → Toast notification (sonner/shadcn)
```

### API Integration

**Axios Instance (`lib/api.ts`):**
```typescript
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

**TanStack Query Setup (`lib/query.ts`):**
- `QueryClient` with default error handling
- `QueryClientProvider` wraps app
- Invalidate queries on mutations (products, categories)

## Aesthetic Direction

**Style:** Modern, clean admin dashboard (not generic AI aesthetic)

- **Typography:** Space Grotesk (headings) + Inter (body)
- **Colors:** Professional blue-gray palette with sharp accent (blue-600)
- **Layout:** Sidebar collapsible, generous whitespace, cards with subtle shadows
- **Motion:** Staggered page load animations, hover states on cards/buttons
- **Differentiation:** Custom sidebar with user info, animated stats cards, distinctive data tables

## File Structure

```
frontend/src/
├── components/
│   ├── ui/              # shadcn components (button, dialog, table, sidebar, etc.)
│   ├── layout/
│   │   ├── Sidebar.tsx      # shadcn sidebar wrapper
│   │   └── AuthGuard.tsx    # Route guard component
│   └── forms/
│       ├── ProductForm.tsx   # Create/edit product modal
│       └── CategoryForm.tsx  # Create/edit category modal
├── pages/
│   ├── Login.tsx           # Login page
│   ├── Dashboard.tsx       # Stats + low stock table
│   ├── Products.tsx        # Products data table
│   └── Categories.tsx     # Categories data table
├── lib/
│   ├── api.ts             # Axios instance + JWT interceptor
│   ├── query.ts           # TanStack Query client
│   ├── schemas.ts         # Zod schemas (mirror backend Pydantic)
│   └── utils.ts           # Helpers
├── App.tsx                   # Router + providers
└── main.tsx                 # Entry point
```

## Success Criteria

- [ ] All pages render correctly with mock data (then real API)
- [ ] Login flow works end-to-end (JWT stored, redirect works)
- [ ] All CRUD operations functional (create, read, update, delete)
- [ ] Dashboard stats display correctly
- [ ] CSV export triggers download
- [ ] Auth guard protects all routes
- [ ] Error handling with toast notifications
- [ ] Responsive (sidebar collapses on mobile)
- [ ] TypeScript strict mode, no `any` types
