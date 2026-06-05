## Why

The personal task kanban only exposes summary cards and a basic edit modal. Users need a focused detail surface for longer Markdown notes, checklist progress, discussion history, and small local attachments without adding a backend.

## What Changes

- Add a full-page task detail view opened from a kanban card.
- Store task descriptions as Markdown and provide split edit/preview rendering.
- Derive interactive subtasks from Markdown checklist lines.
- Add task comments with a remembered local author name.
- Add local attachment upload, download, and deletion with size limits.
- Keep all new task detail data in localStorage.

## Capabilities

### New Capabilities

- `rich-text-task-details`: Full-page task details with Markdown, subtasks, comments, attachments, and local persistence.

### Modified Capabilities

None.

## Impact

- Extends the browser-local task data model with subtasks, comments, and attachments.
- Adds detail-view React components and card-to-detail navigation state.
- Adds `marked` as an application dependency for Markdown rendering.
- Does not add APIs, authentication, databases, or external services.
