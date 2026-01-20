# Phase 1: The "Premium Invite" Experience

This plan focuses on making invites visually stunning and functionally rich.

## User Review Required
> [!IMPORTANT]
> This requires a database schema change to the `Invite` table.

## Proposed Changes

### Database (PostgreSQL)
- Add columns to `Invite` table:
    - `coverImage` (TEXT, nullable): URL for the detailed cover image.
    - `theme` (TEXT, default 'STANDARD'): To support theming (e.g., 'party', 'business', 'minimal').

### Backend (Go)
#### [MODIFY] [models.go](file:///Users/mdsohail/Downloads/code/invito/backend/internal/models/models.go)
- Update `Invite` struct with `CoverImage` and `Theme`.
- Update `CreateInviteRequest` struct.

#### [MODIFY] [invites.go](file:///Users/mdsohail/Downloads/code/invito/backend/internal/repository/invites.go) (Assuming existence, will verify)
- Update `CreateInvite` function to insert new fields.

### Frontend (Next.js)
#### [MODIFY] [index.ts](file:///Users/mdsohail/Downloads/code/invito/src/types/index.ts)
- Update `Invite` interface.

#### [MODIFY] [actions/invites.ts](file:///Users/mdsohail/Downloads/code/invito/src/app/actions/invites.ts)
- Update `createInvite` to accept and send `coverImage` and `theme`.

#### [MODIFY] [create-invite-dialog.tsx](file:///Users/mdsohail/Downloads/code/invito/src/components/events/create-invite-dialog.tsx) (Name guessed, will verify)
- Add "Theme Selector" (color swatches).
- Add "Cover Image" input (URL or simple upload).

#### [MODIFY] [page.tsx](file:///Users/mdsohail/Downloads/code/invito/src/app/event/[id]/page.tsx)
- Redesign the event view to use the `coverImage` as a hero header.
- Apply `theme` styles.

## Verification Plan

### Automated Tests
- Run backend tests (if any) for `CreateInvite`.

### Manual Verification
1.  **Migration:** Run `go run cmd/migrate/main.go` (or equivalent) and check DB.
2.  **Creation:** Create a new invite with a theme and cover image via the UI.
3.  **View:** Verify the invite page displays the cover image and correct theme colors.
