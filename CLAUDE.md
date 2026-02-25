# CLAUDE.md — TutorProvide Admin Web

## Project Overview

**TutorProvide Admin Web** is a Next.js migration of the existing Vue.js admin panel (`tutorprovide-admin`).
It provides the administrative interface for managing the TutorProvide platform.

- **Framework**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + App Router
- **Source Vue app**: `D:\Projects\tp-org\tutorprovide-admin` (reference for migration)

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build — run after major changes to verify
npm run lint     # ESLint
npm start        # Start production server
```

There are no tests configured yet. Do NOT attempt to run test commands.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, lang attr)
│   ├── globals.css                   # Tailwind v4 + @theme brand colors + sidebar vars
│   └── [locale]/                     # Internal segment (never in URL)
│       ├── layout.tsx                # NextIntlClientProvider + AppProviders + Toaster
│       ├── (auth)/                   # Auth pages (centered card layout)
│       │   ├── layout.tsx
│       │   └── login/page.tsx
│       └── (dashboard)/              # Protected pages (sidebar + header layout)
│           ├── layout.tsx
│           └── page.tsx              # Dashboard home
├── components/
│   ├── auth/                         # Login form
│   │   └── login-form.tsx
│   ├── layout/                       # Sidebar, header, breadcrumbs
│   │   ├── sidebar.tsx
│   │   ├── sidebar-nav.tsx
│   │   ├── header.tsx
│   │   └── breadcrumb-nav.tsx
│   ├── providers/                    # App providers
│   │   ├── app-providers.tsx
│   │   ├── query-provider.tsx
│   │   ├── ability-provider.tsx
│   │   └── theme-provider.tsx
│   ├── ui/                           # shadcn/ui components
│   └── shared/                       # Cross-cutting (future)
├── hooks/                            # Custom hooks (future)
├── i18n/
│   ├── routing.ts                    # defineRouting (locales, localePrefix: 'never')
│   └── config.ts                     # getRequestConfig (cookie-based locale)
├── lib/
│   ├── env.ts                        # Zod-validated env vars (API URL only)
│   ├── utils.ts                      # cn() utility
│   ├── api/
│   │   ├── client.ts                 # Axios instance + token refresh queue
│   │   └── endpoints.ts              # API endpoint constants
│   └── auth/
│       └── ability.ts                # CASL ability builder
├── stores/
│   ├── auth-store.ts                 # Zustand: auth state + login/logout
│   ├── locale-store.ts              # Zustand: locale state
│   └── sidebar-store.ts             # Zustand: sidebar collapsed state
├── types/
│   ├── index.ts                      # Barrel re-exports
│   ├── api.ts                        # ApiResponse<T>, TokenResult
│   └── user.ts                       # User, UserType, UserStatus
└── middleware.ts                      # Auth route protection + next-intl
messages/
├── en.json                           # English translations
└── bn.json                           # Bengali translations
```

## Architecture & Conventions

### Routing

- **Locale prefix**: `localePrefix: 'never'` — URLs are clean (`/login` not `/en/login`)
- **`[locale]` segment** is internal only; resolved from cookie, never in the URL
- **Route groups**: `(auth)`, `(dashboard)` — each has its own layout
- **`(auth)`**: centered card layout for login and other auth pages
- **`(dashboard)`**: sidebar + header layout for protected admin pages

### Authentication

- **Login flow**: auth-store `login()` → sets localStorage (accessToken, refreshToken, user) + cookie (`accessToken`) for middleware
- **Middleware**: checks `accessToken` cookie — redirects unauthenticated users from dashboard routes to `/login`; redirects authenticated users away from guest routes (`/login`, etc.)
- **Token refresh**: Axios 401 interceptor with concurrent request queue pattern in `src/lib/api/client.ts`
- **Logout**: clears localStorage + cookie, redirects to `/login`

### State Management

- **Zustand v5** with `persist` middleware for stores
- **auth-store**: authenticated, user, accessToken, refreshToken + actions
- **locale-store**: locale ("en"|"bn") + setLocale (also sets cookie)
- **sidebar-store**: collapsed state for the admin sidebar
- **TanStack Query v5**: staleTime 60s, retry 1, refetchOnWindowFocus false

### i18n

- **Library**: next-intl v4.8.3
- **Locales**: `en` (default), `bn`
- **Server-side**: reads `locale` cookie in `src/i18n/config.ts`
- **Client-side**: `useLocaleStore().setLocale()` sets the cookie
- **Translation files**: `messages/en.json`, `messages/bn.json`
- **Navigation**: use `Link`, `redirect`, `useRouter` from `@/i18n/navigation` (NOT from `next/link` or `next/navigation` for locale-aware routing)

### Styling

- **Tailwind CSS v4** — uses `@theme` block in `globals.css` (NOT `tailwind.config.ts`)
- **Brand colors**: `brand-primary`, `brand-secondary`, `brand-gradient-start`, `brand-gradient-end`, `brand-peach`
- **Dark mode**: full dark theme support via CSS `.dark` class overrides
- **cn() utility**: `src/lib/utils.ts` — always use `cn()` for conditional class merging
- **Component library**: shadcn/ui (new-york style, lucide icons)

### API

- **Base URL**: `NEXT_PUBLIC_API_BASE_URL` (validated via Zod in `src/lib/env.ts`)
- **Client**: `import { api } from "@/lib/api/client"` — typed get/post/put/patch/delete
- **Endpoints**: `import { endpoints } from "@/lib/api/endpoints"` — use instead of hardcoded strings
- **Response shape**: `ApiResponse<T>` with `meta`, `data`, `pagination?`

### Authorization

- **CASL**: `buildAbilityFor(user.permissions)` — permission-based access control
- **Can component**: `import { Can } from "@/components/providers/ability-provider"`
- **useAbility hook**: `import { useAbility } from "@/components/providers/ability-provider"`

### Provider Stack (in order)

```
RootLayout (fonts)
  └─ [locale]/layout (NextIntlClientProvider)
      └─ AppProviders
          └─ QueryProvider (TanStack Query + DevTools)
              └─ AbilityProvider (CASL)
                  └─ {children} + Toaster (sonner)
```

### Sidebar

- **Collapsible**: uses `sidebar-store` (Zustand with persist) to track collapsed state
- **CSS variables**: `--sidebar-width` (16rem) and `--sidebar-width-collapsed` (4rem) defined in `globals.css` `@theme` block
- **Sidebar tokens**: `--color-sidebar`, `--color-sidebar-foreground`, `--color-sidebar-border`, `--color-sidebar-accent`, `--color-sidebar-accent-foreground`
- **Dark mode**: sidebar colors adapt via `.dark` overrides

## Key Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| next | 16.1.6 | Framework |
| react / react-dom | 19.2.3 | UI |
| typescript | ^5 | Type safety |
| tailwindcss | ^4 | Styling (v4 — NOT v3) |
| zustand | ^5 | State management |
| @tanstack/react-query | ^5 | Server state / data fetching |
| axios | ^1.13 | HTTP client |
| next-intl | ^4.8 | i18n (localePrefix: 'never') |
| react-hook-form + zod | ^7 / ^4 | Form handling + validation |
| @casl/ability + @casl/react | ^6 / ^5 | Authorization |
| next-themes | ^0.4 | Dark/light theme switching |
| sonner | ^2 | Toast notifications |
| lucide-react | ^0.575 | Icons |
| shadcn/ui | new-york | Component library (via components.json) |

## Coding Conventions

### General

- Use `"use client"` directive only when the component needs client-side features (hooks, event handlers, browser APIs)
- Prefer Server Components by default
- Use path alias `@/` for all imports (maps to `src/`)
- `noUncheckedIndexedAccess: true` is enabled — handle `undefined` from indexed access
- All env vars are `NEXT_PUBLIC_*` and validated via Zod in `src/lib/env.ts`

### File Naming

- Components: PascalCase (`Sidebar.tsx`, `BreadcrumbNav.tsx`)
- Hooks: camelCase with `use` prefix (`use-fcm.ts`)
- Stores: kebab-case with `-store` suffix (`auth-store.ts`)
- Types: kebab-case (`api.ts`, `user.ts`)
- Pages: always `page.tsx` (Next.js convention)

### Component Patterns

- Place reusable UI components in `src/components/ui/` (shadcn)
- Place feature-specific components in `src/components/<feature>/`
- Place layout components in `src/components/layout/`
- Place providers in `src/components/providers/`
- Place hooks in `src/hooks/`
- Place shared cross-cutting components in `src/components/shared/`

### Adding shadcn/ui Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card dialog input
```

> **Note**: `npx shadcn@latest init` hangs on Windows. The `components.json` was created manually. Adding individual components works fine.

### Making API Calls

```typescript
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ApiResponse, User } from "@/types";

// GET
const { data } = await api.get<ApiResponse<User[]>>(endpoints.USERS);

// POST
const { data } = await api.post<ApiResponse<TokenResult>>(endpoints.LOGIN, { phone, password });
```

### Using TanStack Query

```typescript
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.get(endpoints.USERS).then(res => res.data),
  });
}
```

### Using Translations

```typescript
import { useTranslations } from "next-intl";

function MyComponent() {
  const t = useTranslations("header");
  return <h1>{t("home")}</h1>;
}
```

## Environment Variables

Only 1 variable is defined in `.env.local` and validated in `src/lib/env.ts`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL |

## Migration Context

This project is a migration from the Vue.js admin panel. The Vue source at `D:\Projects\tp-org\tutorprovide-admin` can be referenced for business logic, API integration patterns, and UI details.

When implementing admin features, always reference the corresponding Vue components in the source app for:
- API endpoint usage and request/response shapes
- Business logic and validation rules
- UI layout and component structure
- Permission/authorization checks

## Known Issues

- `npx shadcn@latest init` hangs on Windows — `components.json` was created manually
- Most pages are placeholders — the dashboard currently only has the home page

## Memory

- Never add `co-author` or `reviewer` sections to the commit message. This is a personal project and I don't want any ghost collaborators in my git history.
- When writing commit messages, use the conventional commit format (e.g., `feat: add login page layout`) but do NOT include co-author or reviewer trailers. Keep the commit history clean and focused on the actual changes made.
