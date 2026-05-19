# Origami-CF — Project documentation (deep dive)

This document is a **standalone guide** for understanding the repository end-to-end (interview prep, onboarding, architecture). It does **not** replace `README.md`.

---

## Table of contents

1. [What this project is](#1-what-this-project-is)
2. [Technology stack — what & why](#2-technology-stack--what--why)
3. [Root configuration files](#3-root-configuration-files)
4. [Folder structure & responsibilities](#4-folder-structure--responsibilities)
5. [Routing vs backend — where logic lives](#5-routing-vs-backend--where-logic-lives)
6. [HTTP API reference (implemented routes)](#6-http-api-reference-implemented-routes)
7. [Database models & relationships](#7-database-models--relationships)
8. [Scripts & maintenance utilities](#8-scripts--maintenance-utilities)

---

## 1. What this project is

**Origami-CF** is a full-stack web app that helps competitive programmers practice on **Codeforces** using:

- **Custom virtual contests** (four problems, rating slots, tags, contest ID range).
- **Live-ish submission status** by reading Codeforces submission history during a session.
- **Persisted history**, an **internal practice rating** (not Codeforces’ official delta), **upsolve** and **saved** lists, and **analytics** UI.

The codebase is a **monolithic Next.js app**: UI and HTTP APIs live in one repo and deploy together (e.g. Vercel).

---

## 2. Technology stack — what & why

### Runtime & language

| Technology | What it is | Why this project uses it |
|------------|------------|---------------------------|
| **Node.js** | JavaScript runtime on the server | Powers Next.js dev/production servers and all `app/api/**` Route Handlers. |
| **TypeScript** | Typed superset of JavaScript | Shared types for API payloads, Mongoose documents, hooks, and Codeforces-shaped data reduce runtime bugs and improve refactoring. |

### Application framework & routing

| Technology | What it is | Why this project uses it |
|------------|------------|---------------------------|
| **Next.js 15** (`next`) | React framework with routing, bundling, SSR/SSG capabilities | Single deployment unit: **pages** under `app/` and **REST-like endpoints** under `app/api/**/route.ts`. Fits a college/small-team full-stack project without a separate backend repo. |
| **App Router** (`app/` directory) | Next.js file-system routing where folders define URLs | `app/foo/page.tsx` → `/foo`. Shared chrome lives in `app/layout.tsx`. Metadata (SEO) can be declared via `layout.tsx` / `page.tsx` exports. |
| **React 19 RC** (`react`, `react-dom`) | UI library | Components and hooks drive all interactive screens (contest flow, forms, charts). The project pins RC versions aligned with Next 15 expectations (see `package.json`). |
| **Turbopack dev** (`next dev --turbo`) | Faster dev bundler (optional in Next) | Quicker local feedback during development (`npm run dev`). |

### Styling & UI primitives

| Technology | What it is | Why this project uses it |
|------------|------------|---------------------------|
| **Tailwind CSS** (`tailwindcss`) | Utility-first CSS | Rapid layout/spacing/typography consistent across pages; works well with component libraries that expose `className`. |
| **tailwindcss-animate** | Animation utilities plugin | Subtle UI motion (e.g. loading/feedback) without hand-writing keyframe CSS everywhere. |
| **PostCSS** (`postcss.config.mjs`) | CSS toolchain | Required pipeline for Tailwind to process `app/globals.css`. |
| **`tailwind-merge`** | Merges Tailwind classes safely | Utility `cn()` in `lib/utils.ts` combines conditional classes without conflicting duplicates. |
| **`clsx`** | Conditional `className` builder | Often paired with `tailwind-merge` for readable conditional styling. |
| **`class-variance-authority` (CVA)** | Type-safe variant styling | `components/ui/*` buttons/cards expose consistent variants (size, intent) like shadcn/ui patterns. |
| **Radix UI** (`@radix-ui/react-*`) | Accessible unstyled primitives | Dialogs, dropdowns, scroll areas, etc.—behavior and a11y without building keyboard/focus logic from scratch. |
| **`components.json`** | shadcn/ui style config | Documents Tailwind theme path, aliases (`@/components`, `@/lib/utils`), and icon set choice—keeps generated UI consistent. |
| **`lucide-react`** | Icon pack | Lightweight SVG icons for navbar, trainer, theme toggle, etc. |
| **`input-otp`** | OTP/PIN input UX | Used for 4-digit PIN entry aligned with the auth model. |
| **`next-themes`** | Theme switching for Next.js | Dark/light (or class-based) theme with hydration-safe patterns (`ThemeProvider`). |

### Data, auth & networking

| Technology | What it is | Why this project uses it |
|------------|------------|---------------------------|
| **MongoDB** (via **`mongoose`**) | Document database ODM | Flexible nested documents match **training sessions** (`problems[]`) and per-user queues without heavy joins. Atlas-compatible connection string via env. |
| **`jsonwebtoken`** | JWT sign/verify | Stateless API auth: after PIN login, clients send `Authorization: Bearer <token>`; server verifies `userId` claim. |
| **`bcryptjs`** | Password hashing | PINs are **not** stored plaintext; register/login compare against bcrypt hashes. |
| **`swr`** | React data-fetching + cache | Dedupes/refetches for **history** (`/api/contests`) and **Codeforces-derived caches** in hooks (e.g. problem lists) with configurable `dedupingInterval`. |

### Visualization & analytics UI

| Technology | What it is | Why this project uses it |
|------------|------------|---------------------------|
| **`recharts`** | Chart library for React | Progress/statistics views (line/bar-style analytics) driven by training history and aggregates. |
| **`@uiw/react-heat-map`** | Heat map component | Activity-style visualization (e.g. consistency over time). |

### Quality & tooling

| Technology | What it is | Why this project uses it |
|------------|------------|---------------------------|
| **ESLint** (`eslint`, `eslint-config-next`, `@typescript-eslint/*`) | Static analysis | Catches common React/Next mistakes and TS issues; Next preset aligns with framework rules. |
| **`eslint-config-prettier`** | Disables ESLint rules that fight Prettier | Lets Prettier own formatting without lint conflicts. |
| **Prettier** (`prettier`) | Opinionated formatter | One command (`npm run format`) for consistent style across TS/TSX/JSON/CSS. |
| **TypeScript compiler** (`typescript`, `tsconfig.json`) | Typechecking & module resolution | Strict typing and `@/*` path aliases for imports. |

### External services (not npm packages)

| Integration | Why |
|-------------|-----|
| **Codeforces public API** (`codeforces.com/api/...`) | Source of truth for **handles**, **problemset**, **submissions**, and **profile** fields (rating, avatar). |
| **Hosting (e.g. Vercel)** | Serverless-friendly deployment for Next.js Route Handlers and static assets. |

---

## 3. Root configuration files

| File | Role |
|------|------|
| **`package.json`** | Dependencies, scripts (`dev`, `build`, `start`, `lint`, `format`, `migrate-ratings`). |
| **`package-lock.json`** | Locked dependency tree for reproducible installs. |
| **`tsconfig.json`** | TS compiler options, JSX mode, path aliases (`@/*` → repo root). |
| **`next.config.ts`** | Next.js config—e.g. `images.remotePatterns` for Codeforces avatars (`userpic.codeforces.org`). |
| **`tailwind.config.ts`** | Tailwind theme, content globs, plugins (`tailwindcss-animate`). |
| **`postcss.config.mjs`** | PostCSS plugins (Tailwind). |
| **`components.json`** | UI generator config / conventions (shadcn-style). |
| **`vercel.json`** | Hosting tweaks (`trailingSlash`, `cleanUrls`). |
| **`.eslintrc.json`** | Lint rules. |
| **`.prettierrc`** | Formatting defaults. |
| **`.eslintignore`** | Paths ESLint skips. |
| **`.gitignore`** | VCS ignore patterns. |
| **`.env.example`** | Documents env **names** (at minimum `MONGO_URL`, `JWT_SECRET`). **`ADMIN_KEY`** is required only if you call **`/api/admin/migrate-ratings`**. Never commit real secrets. |

---

## 4. Folder structure & responsibilities

High-level map:

```text
Origami-CF/
├── app/                 # Next.js App Router: pages, layouts, API routes
├── components/          # React UI (feature + shared + ui/)
├── hooks/               # Client-side state & data orchestration
├── lib/                 # Small shared server/client utilities (auth, db, cn)
├── models/              # Mongoose schemas (MongoDB collections)
├── types/               # TypeScript interfaces/types shared across app
├── utils/               # Domain logic (rating, CF API wrappers, performance)
├── public/              # Static assets served as-is
├── scripts/             # Node maintenance scripts (migrations)
├── docs/                # Extra documentation (this file, migrations notes)
└── (config files at repo root)
```

### `app/` — routing, layouts, metadata, backend entrypoints

| Path | Role |
|------|------|
| **`app/layout.tsx`** | **Root layout** for all pages: fonts, global wrapper, `ThemeProvider`, `NavBar`, **`AuthGuard`** around main content, JSON-LD structured data. Defines default SEO metadata. |
| **`app/globals.css`** | Global styles + Tailwind layers / CSS variables used by the design system. |
| **`app/page.tsx`** | **`/`** — landing / login-register entry (marketing + auth UI). |
| **`app/contest/page.tsx`** | **`/contest`** — configure contest (tags, bounds, ratings), problem generation; leads into training. |
| **`app/training/page.tsx`** | **`/training`** — active session UI (timer, trainer, refresh submissions). |
| **`app/history/page.tsx`** | **`/history`** — list past trainings; may invoke delete via hook (see API section). |
| **`app/upsolve/page.tsx`** | **`/upsolve`** — upsolve queue UI. |
| **`app/saved/page.tsx`** | **`/saved`** — saved problems UI. |
| **`app/custom-problems/page.tsx`** | **`/custom-problems`** — custom/saved problem management views. |
| **`app/statistics/page.tsx`** | **`/statistics`** — analytics dashboards (charts / aggregates). |
| **`app/reset-pin/page.tsx`** | **`/reset-pin`** — forgot-PIN flow UX (works with auth reset APIs). |
| **`app/admin/migrate-ratings/page.tsx`** | **`/admin/migrate-ratings`** — admin UI for rating migration (paired with admin API). |
| **`app/not-found.tsx`** | Custom **404** page. |
| **`app/robots.ts`** | Generates **`robots.txt`** (crawler rules). |
| **`app/sitemap.ts`** | Generates **`sitemap.xml`** for SEO. |
| **`app/api/**/route.ts`** | **Backend**: HTTP handlers (GET/POST/PUT/DELETE). Each `route.ts` exports HTTP method functions. Not React—runs on server. |

### `components/` — UI building blocks

| Area | Role |
|------|------|
| **Feature components** (`Trainer.tsx`, `History.tsx`, `Profile.tsx`, `NavBar.tsx`, `TagSelector.tsx`, `ProgressChart.tsx`, `ActivityHeatmap.tsx`, …) | Compose routes into screens; call hooks; render domain UX (contest row, charts, lists). |
| **`AuthGuard.tsx`** | **Client-only** route protection for selected paths (`protectedRoutes` array)—redirects unauthenticated users away from private pages. |
| **`ThemeProvider.tsx`** | Wraps `next-themes` provider for dark/light. |
| **`ClientOnly.tsx`** | Guards children to render only after mount (avoid SSR/client mismatch where needed). |
| **`Loader.tsx`**, **`Error.tsx`** | Shared UX states. |
| **`components/ui/`** | Reusable primitives (Button, Card, Dialog, Table, …) built with Radix + Tailwind + CVA—**presentation layer**, not business rules. |

### `hooks/` — client orchestration (not HTTP routes)

| File | Role |
|------|------|
| **`useUser.ts`** | Auth session: localStorage token/user, login/register/logout, PIN reset/sync-profile calls, SWR cache key for current user, optional token validation. |
| **`useProblems.ts`** | Fetches/caches **full Codeforces problemset** and **user solved set** (via CF); **`getRandomProblems`** implements contest generation rules. |
| **`useTraining.ts`** | **Contest lifecycle**: localStorage persistence of in-progress session, timers, polling submission status, finish → POST save + upsolve enqueue + navigation. |
| **`useHistory.ts`** | SWR fetch of trainings from **`GET /api/contests`**; **`POST /api/contests`** save; optional delete via **`DELETE /api/contests/:id`** (see API section). |
| **`useUpsolvedProblems.ts`**, **`useCustomProblems.ts`**, **`useHeatmapData.ts`**, **`useTags.ts`**, **`useBounds.ts`** | Feature-specific data hooks wrapping `/api/upsolve`, `/api/saved`, tag JSON, bounds helpers, etc. |

### `lib/` — shared libraries

| File | Role |
|------|------|
| **`mongodb.ts`** | **Singleton Mongoose connection** for serverless/lambda-style cold starts—reuses cached connection across invocations. |
| **`auth.ts`** | **`verifyAuth(token)`** — JWT verify helper used by API routes. |
| **`utils.ts`** | **`cn()`** — className merging helper for Tailwind. |

### `models/` — persistence schema (MongoDB)

Defines Mongoose models: **`User`**, **`Training`**, **`UpsolvedProblem`**, **`CustomProblem`**. Consumed only from **server-side** code paths (API routes, scripts).

### `types/` — TypeScript contracts

| File | Typical content |
|------|-----------------|
| **`User.ts`**, **`Training.ts`**, **`TrainingProblem.ts`** | App-level shapes for UI + API bodies. |
| **`Codeforces.ts`** | CF API response-oriented types (problems, submissions). |
| **`Response.ts`** | Typed success/error helpers for util-layer APIs. |

### `utils/` — domain & integration logic

| Path | Role |
|------|------|
| **`utils/codeforces/*`** | Thin wrappers around Codeforces HTTP endpoints (`getUser`, `getAllProblems`, `getSubmissions`, `getSolvedProblems`, `getTrainingSubmissionStatus`). |
| **`utils/ratingSystem.ts`** | **Practice rating** math after a saved session (weights, time factor, soft cap, tiers). |
| **`utils/getPerformance.ts`** | Performance metric used when persisting training (`useHistory` attaches before POST). |
| **`utils/syncUserProfile.ts`** | Pulls CF profile; **`shouldSyncProfile`** throttles sync (e.g. 24h). |
| **`utils/getRankFromRating.ts`**, **`utils/getTags.ts`**, **`utils/ratingMigration.ts`** | Helpers / migration-related rating utilities. |

### `public/` — static files

| Example | Role |
|---------|------|
| **`public/data/tag.json`** | Tag metadata for selectors/filters. |
| SVG / **`og-image`** (if present) | Branding and SEO images referenced from metadata. |

### `scripts/` — one-off Node scripts

Maintenance tasks (e.g. **`migrate-ratings.js`**, **`migrate-lowercase-handles.js`**, **`merge-duplicate-accounts.js`**) run **outside** the Next.js server—use env + Mongoose directly.

### `docs/` — extended docs

| File | Role |
|------|------|
| **`rating-migration.md`** | Notes for rating migration workflow. |
| **`PROJECT_DOCUMENTATION.md`** | This deep-dive document. |

---

## 5. Routing vs backend — where logic lives

| Concern | Primary location |
|---------|------------------|
| **URL → screen** | `app/**/page.tsx` |
| **Shared page chrome, auth wrapper** | `app/layout.tsx`, `components/NavBar.tsx`, `components/AuthGuard.tsx` |
| **Browser-only state** | `hooks/*`, React `useState`/`useEffect` in components |
| **HTTP + DB + secrets** | `app/api/**/route.ts` — **only here** should DB credentials and JWT secrets be relied on for authoritative checks |
| **External HTTP (Codeforces)** | `utils/codeforces/*` (callable from server routes **and** client bundles—be mindful: heavy use from browser increases exposure to CF rate limits) |

**Important distinction:** Anything imported into **`"use client"`** components may ship to the browser. API keys must stay in **`process.env`** on the server; this project’s sensitive vars are **`MONGO_URL`** and **`JWT_SECRET`** (server-side usage in Route Handlers / Mongoose).

---

## 6. HTTP API reference (implemented routes)

All handlers live under **`app/api/.../route.ts`**.

### Auth

| Method | Path | Purpose |
|--------|------|---------|
| POST | **`/api/auth/register`** | Validate CF handle; hash PIN; create **`User`**. |
| POST | **`/api/auth/login`** | Verify PIN; optional CF profile sync; return JWT + user DTO. |
| POST | **`/api/auth/validate-token`** | Verify Bearer JWT and ensure user still exists. |
| POST | **`/api/auth/sync-profile`** | Authenticated CF profile refresh for stored user fields. |
| POST | **`/api/auth/reset-pin`** | Logged-in PIN change **or** forgot-PIN completion using **`resetToken`**. |
| POST | **`/api/auth/initiate-reset`** | Start forgot-PIN: returns short-lived **`verificationToken`**. |
| POST | **`/api/auth/verify-submission`** | Confirms CF-side verification submission pattern; returns **`resetToken`**. |

### Application data

| Method | Path | Purpose |
|--------|------|---------|
| GET, POST | **`/api/contests`** | **GET**: list current user’s trainings. **POST**: save training, update practice rating, return **`ratingChange`** payload. |
| GET, POST, PUT, DELETE | **`/api/upsolve`** | Upsolve queue CRUD-style operations (bulk insert/update tolerant of duplicates). |
| GET, POST, PUT, DELETE | **`/api/saved`** | Saved/custom problems list per user. |

### Admin

| Method | Path | Purpose |
|--------|------|---------|
| GET | **`/api/admin/migrate-ratings`** | Preview rating migration (`previewRatingMigration`). |
| POST | **`/api/admin/migrate-ratings`** | Run full migration; body must include `{ "confirm": true }`. |
| PUT | **`/api/admin/migrate-ratings`** | Recalculate one user; body `{ "codeforcesHandle": "..." }`. |

**Auth:** All three require header **`x-admin-key`** matching env **`ADMIN_KEY`**. If `ADMIN_KEY` is unset, every request is denied (route refuses open access).

**Client expectation vs codebase:** `hooks/useHistory.ts` calls **`DELETE /api/contests/:trainingId`** for history deletion. That requires a matching Route Handler such as **`app/api/contests/[trainingId]/route.ts`** exporting `DELETE`. If that file is absent in your checkout, delete-from-history will fail until implemented—this hook was written against an intended REST shape.

---

## 7. Database models & relationships

MongoDB stores documents in **collections** mapped by Mongoose **models**. Relationships are **logical** (ObjectId references + embedded arrays), not SQL foreign keys.

### Entity overview

```text
User (1) ──< (many) Training
User (1) ──< (many) UpsolvedProblem
User (1) ──< (many) CustomProblem   [saved list]
```

### `User` (`models/User.ts`)

| Field (conceptual) | Purpose |
|--------------------|---------|
| `codeforcesHandle` | Display/login handle (normalization evolved over time). |
| `codeforcesHandleLower` | Lowercase index for uniqueness lookups (registration path). |
| `pin` | Bcrypt hash of 4-digit PIN. |
| `rating`, `rank`, `maxRating`, `maxRank` | Cached competitive stats; **`rating`/`rank`** also reflect **Origami practice rating** after trainings (see contests POST). |
| `avatar`, `organization` | Cached from Codeforces. |
| `lastSyncTime` | Throttle CF profile sync (`syncUserProfile` / login). |

### `Training` (`models/Training.ts`)

| Field (conceptual) | Purpose |
|--------------------|---------|
| `user` | **ObjectId → `User`** — owner. |
| `startTime`, `endTime` | Session window (epoch ms). |
| `customRatings` | `{ P1..P4 }` chosen difficulty targets for the four slots. |
| `problems[]` | Embedded snapshot of the four problems + `solvedTime` per problem. |
| `performance` | Computed metric stored for analytics (see `getPerformance` / client pre-POST). |

**Connection:** Each training document **belongs to one user** via `user`. Query pattern: `Training.find({ user: userId }).sort({ startTime: -1 })`.

### `UpsolvedProblem` (`models/UpsolvedProblem.ts`)

| Field (conceptual) | Purpose |
|--------------------|---------|
| `user` | **ObjectId → `User`**. |
| Problem identity | `contestId`, `index`, `name`, `rating`, `tags`, `url`. |
| `solvedTime` | Nullable until synced as solved. |
| `createdAt` | Queue ordering / auditing. |

**Uniqueness:** Compound index **`{ user: 1, contestId: 1, index: 1 }`** unique — prevents duplicate queue rows per user per problem.

### `CustomProblem` (`models/CustomProblem.ts`)

Represents **saved** problems (manual/custom list), parallel shape to training problems.

| Field (conceptual) | Purpose |
|--------------------|---------|
| `userId` | **ObjectId → `User`**. |
| Problem fields | Same contest/problem identifiers + metadata. |

**Uniqueness:** Index **`{ userId: 1, contestId: 1, index: 1 }`** unique.

### How collections relate at runtime

1. **Login/register** creates or loads **`User`**.
2. **Finish contest** → **`Training`** insert + **`User`** practice rating update in one transactional intent (two writes in `POST /api/contests`).
3. **Upsolve** rows reference **`User`**; bulk ops update many **`UpsolvedProblem`** docs by `{ user, contestId, index }`.
4. **Saved** problems reference **`User`** via **`userId`**.

There is **no** embedded array of all trainings inside `User`—trainings are **queried by foreign key** `Training.user`.

---

## 8. Scripts & maintenance utilities

| Script | Role |
|--------|------|
| **`npm run migrate-ratings`** | Runs **`scripts/migrate-ratings.js`** — batch rating migration (uses DB directly). |
| **`scripts/migrate-lowercase-handles.js`** | Data cleanup for handle casing consistency. |
| **`scripts/merge-duplicate-accounts.js`** | Dedupes problematic user rows if duplicates existed. |

These bypass Next.js HTTP—they connect with Mongoose using environment configuration appropriate for your deployment secrets workflow.

---

## Quick mental model (interview soundbite)

- **Next.js** owns **routing** (`app/pages`) and **HTTP APIs** (`app/api`).
- **MongoDB** owns **durable user-specific state** (sessions, queues, pins).
- **Codeforces API** owns **global problem/submission truth** at practice time.
- **Hooks** orchestrate **browser persistence + timers + fetch**, keeping Route Handlers thin but authoritative for auth and writes.

---

*Last aligned with repository layout and dependencies as of the documented checkout; if you add routes (e.g. `DELETE /api/contests/[id]`), update §6 accordingly.*
