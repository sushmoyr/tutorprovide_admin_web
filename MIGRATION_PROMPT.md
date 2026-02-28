# Vue.js → Next.js Batch Migration Prompt

> Copy the section below (between the --- markers) and paste it as a prompt to Claude Code.
> Replace `<FEATURE_NAMES>` with a comma-separated list of feature section names from MIGRATION_CHECKLIST.md.
>
> **Example usage:**
> ```
> ... Address Configuration, Employee Configuration, Tuition Configuration, FAQs, Coupons, Feedback
> ```

---

## Prompt

You are migrating pages from a Vue.js admin panel to a Next.js admin panel. Your goal is to migrate all pending (unchecked) items from the following feature sections in `MIGRATION_CHECKLIST.md`:

**Features to migrate:** 
- Roles & Permissions
- Welcome Greetings
- Walkthroughs
- Notices
- Advertisements
- Blogs
- Galleries
- FAQs
- Feedback
- Coupons
- Settings & Welcome Modals
- Content — Terms & Policies
- Content — Video Tutorials
- Team

---

### Step 0 — Read project conventions

Read these files first to understand the project architecture, conventions, and existing patterns:

1. `CLAUDE.md` — Full project conventions, architecture, file structure, and coding standards.
2. `MIGRATION_CHECKLIST.md` — Check which items are already done (`[x]`) and which are pending (`[ ]`). Only work on pending items from the feature sections listed above.
3. Skim 1-2 existing completed features for reference patterns:
   - Hook: `src/hooks/use-counters.ts` (simple CRUD with pagination/sorting)
   - Types: `src/types/counter.ts`
   - List component: `src/components/counters/counters-list.tsx` (table with sort, pagination, delete dialog)
   - Create dialog: `src/components/counters/create-counter-dialog.tsx`
   - Edit dialog: `src/components/counters/edit-counter-dialog.tsx`
   - Page: `src/app/[locale]/(dashboard)/counters/page.tsx`
   - For image upload patterns, reference: `src/hooks/use-banners.ts`, `src/components/banners/create-banner-dialog.tsx`
   - For features without pagination (simple list), reference: `src/hooks/use-partners.ts`

### Step 1 — Plan the batch

From the feature sections listed above, identify ALL pending checklist items. Group them by feature section. List what you will build for each (types, hooks, components, pages, translations). This is your work plan — present it briefly, then proceed without waiting.

### Step 2 — API lookup (MANDATORY for every feature)

Before writing ANY code for a feature, you MUST use the swagger-lookup skill (`/swagger-lookup`) to look up the API endpoints for that feature. This gives you:
- Exact endpoint paths and HTTP methods
- Request body schemas (including which fields are required)
- Response shapes (pagination support, field names, nested objects)
- Query parameters (pagination, sorting, filtering params)

**Example lookups:**
```
/swagger-lookup search docs/api-docs.json division
/swagger-lookup search docs/api-docs.json category
/swagger-lookup tag docs/api-docs.json FAQ
/swagger-lookup detail docs/api-docs.json GET /api/v1/admin/districts
```

If the swagger docs don't have a matching endpoint, check the Vue.js source for the API call patterns. The Vue.js source is at: `D:\Projects\tp_workspace\tutorprovide-admin\`

### Step 3 — Reference the Vue.js source

For each feature, read the corresponding Vue.js components to understand:
- Business logic, validation rules, and form fields
- UI layout and user flows
- Which API fields map to which form inputs
- Any special handling (image uploads, rich text, nested selects, etc.)

Vue.js source locations:
- Views: `../tutorprovide-admin/src/views/admin/<feature>/`
- Components: `../tutorprovide-admin/src/components/`
- Services/API: `../tutorprovide-admin/src/services/`
- Router: `../tutorprovide-admin/src/router.js`

### Step 4 — Implement using subagents (PRIORITIZE PARALLEL WORK)

**You MUST maximize the use of subagents (Task tool) for parallel development.** This is critical for batch migration speed.

**Strategy:**
- Launch multiple subagents in parallel, each handling an independent piece of work.
- Each subagent should be given clear, self-contained instructions with all context it needs.
- Only use sequential (non-parallel) work when there are true dependencies.

**Parallelization patterns:**

1. **Types + Hooks + Endpoints** — For each feature, these can be built in parallel subagents since they're independent files:
   - Subagent A: Create type definitions in `src/types/<feature>.ts` and update barrel export in `src/types/index.ts`
   - Subagent B: Add endpoint constants to `src/lib/api/endpoints.ts`
   - Subagent C: Create hook file `src/hooks/use-<feature>.ts` (give it the API response shape from swagger lookup)

2. **Components** — After types/hooks exist, launch component subagents in parallel:
   - Subagent D: Create list component `src/components/<feature>/<feature>-list.tsx`
   - Subagent E: Create create dialog `src/components/<feature>/create-<feature>-dialog.tsx`
   - Subagent F: Create edit dialog `src/components/<feature>/edit-<feature>-dialog.tsx`

3. **Cross-feature parallelism** — Different features are fully independent. You can work on Feature A's components while building Feature B's types/hooks simultaneously.

4. **Translations** — Can be batched: one subagent adds all new translation keys for multiple features to both `messages/en.json` and `messages/bn.json`.

5. **Pages** — Simple wrappers, can be batched in one subagent: create `src/app/[locale]/(dashboard)/<feature>/page.tsx` for multiple features.

**What each subagent needs in its prompt:**
- The exact file path to create/modify
- Complete context: type shapes (from swagger), existing patterns to follow (reference file paths)
- Translation key namespace to use
- Clear instruction whether to create a new file or edit an existing one

### Step 5 — Follow these implementation standards

**For every feature, ensure:**

1. **Types** (`src/types/<feature>.ts`):
   - Match the API response shape exactly (from swagger lookup)
   - Export from `src/types/index.ts`

2. **Endpoints** (`src/lib/api/endpoints.ts`):
   - Add constants for all endpoints (list, create, update, delete, detail)
   - Use functions for parameterized paths: `featureById: (id: number) => \`/path/${id}\``

3. **Hooks** (`src/hooks/use-<feature>.ts`):
   - `useFeatureList()` — useQuery with pagination/sorting params (if API supports it)
   - `useCreateFeature()` — useMutation + queryClient.invalidateQueries
   - `useUpdateFeature()` — useMutation + queryClient.invalidateQueries
   - `useDeleteFeature()` — useMutation + queryClient.invalidateQueries
   - Always check swagger for available query params (page, size, sortBy, order, search, filters)

4. **List component** (`src/components/<feature>/<feature>-list.tsx`):
   - Use the table pattern from banners/counters (NOT timeline, NOT cards)
   - `bg-muted hover:bg-muted` on TableHeader, `hover:bg-muted/50` on rows
   - `rounded-lg border bg-card text-card-foreground` wrapper
   - Add sorting if API supports `sortBy`/`order` params
   - Add pagination with `PageSizeSelector` if API supports `page`/`size`
   - Add delete confirmation via `AlertDialog`
   - Inline edit/delete action buttons

5. **Create/Edit dialogs**:
   - Use `Dialog` from shadcn/ui
   - Use `react-hook-form` + `zod` for validation
   - For image fields: file input with preview, FormData upload
   - For rich text: use `BlockEditor` from `src/components/shared/block-editor.tsx`
   - Toast on success via `sonner`

6. **Page** (`src/app/[locale]/(dashboard)/<feature>/page.tsx`):
   - `"use client"` directive
   - Title + subtitle from translations
   - Add New button (if create exists) wired to create dialog
   - Render the list component

7. **Translations**:
   - Add keys to BOTH `messages/en.json` and `messages/bn.json`
   - Follow existing namespace patterns (feature name as key)
   - Include: title, subtitle, column headers, form labels, placeholders, success/error messages, dialog titles/descriptions, pagination labels

8. **Sidebar** — Only add to sidebar if the feature doesn't already have an entry in `src/components/layout/sidebar-nav.tsx`. Most features are already listed there.

### Step 6 — Verify and update checklist

After implementing all features:

1. Run `npx tsc --noEmit` to verify there are no type errors.
2. Run `npx next build` to verify the build succeeds.
3. Update `MIGRATION_CHECKLIST.md` — check off all items you completed (`[x]`).
4. Update the Progress Summary counts at the bottom.

### Step 7 — Commit

Create a single commit with all changes:
```
feat: migrate <feature names> to Next.js

Adds list pages, CRUD dialogs, hooks, types, and translations
for <feature names>.
```

Do NOT add co-author or reviewer trailers.

---

### Important reminders

- **string(binary) in swagger = multipart form data** (file upload). Use FormData for these.
- **SortOrder is uppercase**: `"ASC"` | `"DESC"` — use the `SortOrder` type from `@/types`.
- **api.get params are flat objects** — the wrapper nests them inside `{ params }` automatically.
- **Always use `@/` path alias** for imports.
- **Use `Link`, `redirect`, `useRouter` from `@/i18n/navigation`**, NOT from `next/link` or `next/navigation`.
- **Bengali translations**: Write actual Bengali text, not transliterated English. Reference existing `messages/bn.json` for style.
- **No column borders in tables, no alternate row colors.**
- If a Vue.js page is a simple CRUD list+create+edit, follow the counters/banners pattern exactly.
- If a Vue.js page has unique business logic (e.g., tuition management with status workflows), read the Vue source carefully before implementing.
- Do not create detail pages as separate routes if the detail view can be a dialog/modal.
- Must create internal tasks for each feature to systenatically track progress.
- Update the Migration Checklist in `MIGRATION_CHECKLIST.md` as you go.

---
