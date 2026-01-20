# Invito - AI Coding Agent Instructions

## Issue-to-PR Workflow

When assigned a GitHub issue, follow this systematic approach to implement features or fixes:

### 1. Context Gathering

- Read the issue description and acceptance criteria
- Search codebase for related files using semantic search
- Review existing patterns in similar features (e.g., if adding a new resource, check how `circles` or `invites` are implemented)
- Check if database schema changes are needed

### 2. Architecture Planning

- Create a task breakdown using `manage_todo_list` tool
- Identify required components:
  - **Backend**: Handlers, repository methods, database migrations
  - **Frontend**: Server Actions, UI components, type definitions
- Document architectural decisions in PR description (not separate files)

### 3. Implementation Order

Follow this sequence to minimize dependency issues:

1. **Database**: Create migrations if schema changes needed

   ```bash
   # Create XXX_feature_name.up.sql and XXX_feature_name.down.sql
   cd backend && make migrate
   ```

2. **Backend**:
   - Add types to `internal/models/models.go`
   - Create repository interface in `internal/repository/interfaces.go`
   - Implement repository in `internal/repository/feature.go`
   - Add handler in `internal/handlers/feature.go`
   - Register routes in `cmd/api/main.go`
   - Write tests in `internal/handlers/feature_test.go`

3. **Frontend**:
   - Add types to `src/types/index.ts`
   - Create Server Actions in `src/app/actions/feature.ts`
   - Build UI components in `src/components/feature/`
   - Create pages in `src/app/feature/`

4. **Validation**:

   ```bash
   # Run tests
   cd backend && make test

   # Check for errors
   npm run lint

   # Test locally
   npm run dev  # Terminal 1
   cd backend && make run  # Terminal 2
   ```

### 4. Pull Request Creation

- Create feature branch: `git checkout -b feature/issue-number-description`
- Commit with clear messages referencing issue: `feat: add feature (#123)`
- Run `git push origin feature/issue-number-description`
- PR title should reference issue: `Fixes #123: Feature description`
- Include in PR body:
  - Summary of changes
  - Architectural decisions made
  - Testing steps
  - Any new environment variables or migration requirements

### 5. Pre-PR Checklist

- [ ] All Critical Patterns followed (see below)
- [ ] Backend tests pass (`make test`)
- [ ] Types match between frontend and backend
- [ ] Migrations tested (up and down)
- [ ] `revalidatePath()` called for mutations
- [ ] No client-side `fetch()` calls (Server Actions only)
- [ ] Error handling uses `api.Err*` constructors

## Architecture Overview

**Monorepo Structure**: Full-stack social event invitation app with:

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui
- **Backend**: Go 1.25 REST API with Chi router
- **Database**: PostgreSQL (managed via manual migrations)
- **Auth**: NextAuth.js v5 (frontend) synchronized with Go backend via JWT validation

### Key Data Flow

1. User authenticates via NextAuth.js OAuth providers (GitHub/Google)
2. Frontend syncs user to backend via `/api/auth/sync` with short-lived JWT
3. Backend validates session tokens (JWS) from NextAuth using shared secret
4. All API calls from Next.js Server Actions → `fetchFromBackend()` → Go API

## Backend (Go)

### Project Structure

- `cmd/api/main.go`: Entry point, router setup with Chi
- `internal/handlers/`: HTTP handlers using custom `api.Handler` adapter
- `internal/repository/`: Repository pattern with interface-based design
- `internal/api/adapter.go`: Custom error handling wrapper returning structured JSON errors
- `internal/auth/auth.go`: JWT middleware validates NextAuth tokens from header/cookies

### Critical Patterns

**Handler Pattern**: All handlers return `error`, converted to JSON by `api.Handler`:

```go
func (h *Handler) Method(w http.ResponseWriter, r *http.Request) error {
    if err != nil {
        return api.ErrBadRequest("message") // or ErrNotFound, ErrUnauthorized, ErrInternal
    }
    return json.NewEncoder(w).Encode(result)
}
```

**Repository Interfaces** (`internal/repository/interfaces.go`): Each domain has interface + implementation:

- `CircleRepository`, `InviteRepository`, `FeedRepository`, `AuthRepository`
- All use `sqlx.DB` for SQL execution
- Main `Repository` struct aggregates all sub-repositories

**Auth Context**: Extract user ID in protected handlers:

```go
userID, ok := auth.UserIDFromContext(r.Context())
if !ok {
    return api.ErrUnauthorized("Unauthorized")
}
```

**Testing**: Use `go-sqlmock` for repository testing (see `handlers/*_test.go`):

- Mock DB interactions with `sqlmock.Sqlmock`
- Test handler functions with `httptest.ResponseRecorder`
- Context injection for auth: `context.WithValue(r.Context(), auth.UserIDKey, "user-123")`

### Development Commands (from `backend/Makefile`)

```bash
make build          # Build API binary
make test           # Run all tests
make coverage       # Generate coverage report
make migrate        # Run pending migrations
make migrate-status # Check migration state
make run            # Run API locally
```

## Frontend (Next.js)

### Critical Files

- `src/lib/api.ts`: `fetchFromBackend()` extracts NextAuth session token and proxies to Go API
- `src/auth.ts`: NextAuth config with JWT callback that syncs users on sign-in
- `src/app/actions/*.ts`: Server Actions are the ONLY way to call backend (no client-side fetch)
- `src/types/index.ts`: TypeScript types matching Go backend models

### API Communication Pattern

**Always use Server Actions** → `fetchFromBackend()` → Go backend:

```typescript
// src/app/actions/circles.ts
export async function createCircle(formData: FormData) {
	const result = await fetchFromBackend("/circles", {
		method: "POST",
		body: JSON.stringify({ name, description }),
	});
	revalidatePath("/"); // Invalidate cache
	return result;
}
```

**Never** directly call backend from client components - use Server Actions.

### UI Components

- **shadcn/ui**: Components in `src/components/ui/` (installed via CLI, not npm)
- **Tailwind v4**: PostCSS-based, configured in `postcss.config.mjs`
- **Lucide Icons**: `lucide-react` for all icons
- **Toast Notifications**: `sonner` library

### PWA Setup

- Service Worker: `src/app/sw.ts` compiled to `public/sw.js` via Serwist
- Manifest: `src/app/manifest.ts` defines app metadata
- Icons: Generated via `scripts/generate-icons.js`

## Database

### Migration Workflow

Migrations in `backend/migrations/` use custom Go tool (`cmd/migrate/main.go`):

```bash
cd backend
make migrate        # Apply pending migrations
make migrate-down   # Rollback last migration
```

**Schema Conventions**:

- Tables use PascalCase: `"User"`, `"Circle"`, `"Invite"`
- All IDs are `TEXT` (not UUIDs) - generated client-side
- Foreign keys have explicit `ON DELETE CASCADE`

## Environment Setup

### Required Variables

**Root `.env`** (for Next.js):

```
DATABASE_URL=postgresql://...
AUTH_SECRET=<random-string>
AUTH_TRUST_HOST=true
BACKEND_URL=http://localhost:8080/api
NEXTAUTH_URL=http://localhost:3000
```

**Backend reads from `../.env`** (one level up from `backend/`):

- `DATABASE_URL`, `PORT`, `NEXTAUTH_SECRET` (must match frontend `AUTH_SECRET`)

## Development Workflow

### First-Time Setup

```bash
# Frontend
npm install
npm run dev

# Backend (separate terminal)
cd backend
make migrate
make run
```

### Running Tests

```bash
# Backend only
cd backend
make test
make coverage  # Opens HTML coverage report
```

### Common Tasks

- Add new API endpoint: Create handler in `internal/handlers/`, register route in `cmd/api/main.go`
- Add new Server Action: Create in `src/app/actions/`, import in component
- Add shadcn component: `npx shadcn@latest add <component-name>`
- New migration: Create `XXX_description.up.sql` and `XXX_description.down.sql` in `backend/migrations/`

## Critical Patterns to Follow

### 1. Authentication Token Handling

**When adding auth to new endpoints**: Backend `auth.Middleware` checks 4 cookie name variants (`__Secure-authjs.session-token`, `authjs.session-token`, `__Secure-next-auth.session-token`, `next-auth.session-token`) plus Bearer tokens. Never hardcode a single cookie name - the middleware handles all variants automatically.

**Action**: Always use `auth.UserIDFromContext(r.Context())` in protected handlers. Never parse cookies manually.

### 2. Frontend API Communication

**When calling backend from frontend**: NEVER use `fetch()` directly from client components. ALL backend calls MUST go through Server Actions in `src/app/actions/*.ts` which use `fetchFromBackend()`.

**Action**: Create a new Server Action if one doesn't exist. Include `revalidatePath()` for mutations:

```typescript
export async function yourAction(data: FormData) {
    const result = await fetchFromBackend("/your-endpoint", { method: "POST", body: JSON.stringify({...}) });
    revalidatePath("/relevant-path");
    return result;
}
```

### 3. Error Handling Consistency

**When writing Go handlers**: Backend MUST return structured errors via `api.ErrBadRequest()`, `api.ErrNotFound()`, `api.ErrUnauthorized()`, or `api.ErrInternal()`. These automatically convert to `{"error": "message"}` JSON responses.

**Action**: Never write custom error JSON. Use the error constructors:

```go
if something fails {
    return api.ErrBadRequest("Clear user-facing message")
}
```

### 4. Database Transactions

**When creating multi-step DB operations**: Use transactions for operations that create multiple related records (like circle + owner membership). See `circles.go:CreateCircle()` for the pattern.

**Action**: Wrap related inserts in `db.Begin()` / `tx.Commit()`:

```go
tx, err := h.Repo.DB.Begin()
defer tx.Rollback() // Safe to call even after commit
// ... multiple tx.Exec() calls ...
return tx.Commit()
```

### 5. Cache Invalidation

**When mutating data in Server Actions**: Next.js caches aggressively. Mutations MUST call `revalidatePath()` or stale data will display.

**Action**: Add `revalidatePath("/")` or specific path after every mutating `fetchFromBackend()` call. See `src/app/actions/circles.ts` for examples.

### 6. Environment Variables

**When deploying or adding features needing config**: Backend reads from `../.env` (parent directory). `AUTH_SECRET` and `NEXTAUTH_SECRET` MUST match between frontend and backend.

**Action**: Always update both root `.env` AND document new vars needed. Check `backend/internal/config/config.go` for current vars.
