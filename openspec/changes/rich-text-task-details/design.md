## Context

The existing React kanban stores tasks in localStorage and renders summary cards in three status columns. This change adds a detail experience while preserving the local-only architecture and avoiding a router or backend.

## Goals / Non-Goals

**Goals:**

- Open a focused task detail page from a kanban card and return to the board.
- Edit and preview Markdown task descriptions.
- Expose Markdown checklists as interactive subtasks with progress.
- Persist comments and small attachments alongside each task.
- Keep the application independently installable from `task-kanban/`.

**Non-Goals:**

- WYSIWYG editing.
- Image previews.
- Authentication, multi-user collaboration, or backend persistence.
- Large-file storage or production document management.

## Decisions

### State-driven detail navigation

Store `selectedTaskId` in the existing task context. `App` renders either the board or `TaskDetailPage`. This avoids introducing a router for a two-surface local demo.

### Markdown source as the canonical description

Keep Markdown in `task.description` and render previews with `marked`. Subtasks are derived from `- [ ]` and `- [x]` lines so preview toggles can update the same canonical text.

### Browser-local comments and attachments

Store comments and base64 attachment data on the task object in localStorage. Limit each file to 500KB and total attachments per task to 2MB to reduce storage pressure.

### Test environment storage binding

In Vitest setup, explicitly bind the test global `localStorage` to `globalThis.jsdom.window.localStorage`. Node 25 exposes an incomplete process-global `localStorage` object that otherwise prevents Vitest from installing jsdom's implementation.

## Risks / Trade-offs

- [Risk] Base64 attachments consume localStorage quota quickly. -> Mitigate with per-file and per-task limits.
- [Risk] Markdown preview uses rendered HTML. -> Keep rendering local and avoid external content or backend transmission.
- [Risk] Node runtime globals can conflict with browser test globals. -> Cover the jsdom localStorage binding with a regression test.
- [Trade-off] State-driven navigation has no shareable detail URL. -> Accept for the local demo; add a router only if URL navigation becomes a requirement.

## Migration Plan

Existing tasks remain valid because new fields are optional. Install dependencies from `task-kanban/`, run the test, lint, and production build commands, then validate this OpenSpec change. Rollback removes the detail components and optional fields without migrating persisted tasks.

## Open Questions

None.
