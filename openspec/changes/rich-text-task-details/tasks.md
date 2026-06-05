## 1. Task Detail Data And Utilities

- [x] 1.1 Add `marked`, subtask, comment, and attachment types.
- [x] 1.2 Add tested Markdown subtask parsing and toggle utilities.
- [x] 1.3 Add tested attachment size validation for 500KB per file and 2MB per task.

## 2. Task Detail Interface

- [x] 2.1 Add detail selection state and card-to-detail navigation.
- [x] 2.2 Add the split Markdown editor and preview toolbar.
- [x] 2.3 Add task properties, subtask progress, comments, attachments, and detail actions.
- [x] 2.4 Add task detail styles and local demo seed data.

## 3. Repair Independent Project State

- [x] 3.1 Move Markdown dependencies from the repository root into `task-kanban/`.
- [x] 3.2 Bind Vitest localStorage to jsdom storage under Node 25.
- [x] 3.3 Add a regression test for the jsdom localStorage binding.

## 4. Checkpoint 3 Verification

- [x] 4.1 Run `npm test`.
- [x] 4.2 Run `npm run lint`.
- [x] 4.3 Run `npm run build`.
- [x] 4.4 Run `openspec status --change rich-text-task-details`.
- [x] 4.5 Run `openspec validate rich-text-task-details --strict`.
- [x] 4.6 Retry browser regression testing. The in-app browser reported `Browser is not available: iab`, so page-click acceptance testing remains unverified in this environment.
