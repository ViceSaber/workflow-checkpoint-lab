# CLAUDE.md

This repository uses the canonical workflow in `.ai-workflow/docs/workflow.md`.
Read these files before starting any task:

- `.ai-workflow/docs/workflow.md`
- `.ai-workflow/docs/risk-policy.md`
- `.ai-workflow/docs/security-baseline.md`
- `.ai-workflow/docs/context-budget-policy.md`
- `.ai-workflow/docs/profiles.md`

`.ai-workflow/docs/profiles.md` lists the active stack and domain policy
documents. Read each listed document before planning implementation.

## Required Stack

- OpenSpec CLI and generated OpenSpec skills.
- Project-local Superpowers skills under `.claude/skills/`, or under
  `.ai-workflow/runtime/skills/claude/` in compact layout.
- Claude SessionStart hook that injects the local Superpowers bootstrap when
  Claude Code starts, clears, or compacts a session.
- Claude checkpoint hooks that record approvals and gate ordinary
  implementation changes.
- Three human approval checkpoints.

## Claude Behavior

1. Verify OpenSpec is available with `openspec --version` and `openspec list`.
2. Verify project-local Superpowers skills exist under `.claude/skills/` or
   `.ai-workflow/runtime/skills/claude/`.
3. Prefer automatic Superpowers activation from the SessionStart hook. Then use
   `/using-superpowers` first when a task may match a Superpowers skill. If
   slash skill invocation is unavailable, read
   `.claude/skills/using-superpowers/SKILL.md` and follow it manually.
   Do not claim Superpowers was invoked unless it actually was.
4. For new features, behavior changes, bug fixes, or substantial refactors, use
   `/brainstorming` and the OpenSpec propose flow before coding.
5. Classify the task with `.ai-workflow/docs/risk-policy.md` before
   implementation. Apply the stricter rule when an active profile raises the
   required level.
6. Use OpenSpec-native changes under `openspec/changes/<change-name>/`.
   Create and maintain `risk.json` under that change. Present its level, reasons,
   higher-risk exclusions, profile metadata, and rollback for human review.
   Before Checkpoint 1, write only the proposal package:
   `proposal.md`, `design.md`, `tasks.md`, `risk.json`, `.openspec.yaml` when
   needed, and `specs/**/spec.md`. Do not include `implementation-scope.json`
   in the same patch.
7. Before Checkpoint 2, create and maintain
   `implementation-scope.json` under that change. It must list the exact
   implementation files, directories, globs, and optional anchors that the
   approved plan is allowed to touch.
8. Do not implement before Checkpoint 1 and Checkpoint 2 are approved, unless
   the user explicitly overrides the workflow.
9. Use Superpowers TDD/debug/review/verification skills during implementation
   only when those skills are callable or their local `SKILL.md` files have been
   read and followed manually.
10. Run `openspec validate <change-name>` and the project test command before
   final delivery when applicable.
11. Before broad file reading, follow
    `.ai-workflow/docs/context-budget-policy.md`. Build a file map with
    read-only discovery commands first, then full-read only files needed for the
    approved planning scope.

## Checkpoint Guards

Claude and Codex checkpoint commands are recorded locally per active OpenSpec
change in `.ai-workflow/state/workflow-checkpoints.local.json`. Ordinary source
writes and shell commands outside the pre-implementation allowlist remain
blocked until Checkpoint 2 is approved.
Checkpoint 1 requires passing OpenSpec validation. If `openspec validate <change-name> --strict` fails, fix the OpenSpec artifacts before asking for approval; do not continue to checkpoint approval and do not describe validation as non-blocking.
Checkpoint 2 also binds the approved implementation scope. If
`implementation-scope.json` is missing, malformed, changed after approval, or
does not include the target file/anchor, ordinary implementation writes are
blocked until the scope is fixed and Checkpoint 2 is re-approved.

Use exact commands as complete user messages:

- `CHECKPOINT SELECT <change-name>`
- `CHECKPOINT APPROVE 1 <change-name>`
- `CHECKPOINT APPROVE RISK <change-name>`
- `CHECKPOINT APPROVE 2 <change-name>`
- `CHECKPOINT APPROVE 3 <change-name>`
- `CHECKPOINT PAUSE <change-name>`
- `CHECKPOINT CLOSE <change-name>`

Select the intended change explicitly when multiple changes exist under
`openspec/changes/`. Approval commands also select their named change.
Approval commands also automatically pause the current active change without deleting its artifacts or approvals. Generic phrases such as `Proceed` do not update
checkpoint state. These hooks are workflow guardrails, not a security sandbox.
After final delivery, ask the user to approve Checkpoint 3 after reviewing the
verification evidence, then close the completed change. Closing clears its
active selection and resets its local approval so a later task cannot inherit
implementation permission.

`CHECKPOINT PAUSE <change-name>` clears the active selection but preserves all
checkpoint approvals and risk state. Use PAUSE to temporarily set aside work on
one change. `CHECKPOINT SELECT` automatically pauses the current active change
before switching, so switching does not require closing or losing progress.

One workspace directory supports one selected active change at a time. Use a
separate git worktree for concurrent work instead of running multiple
implementation tasks in the same directory.

`CHECKPOINT SELECT <change-name>` only selects an existing OpenSpec change. It
never creates an OpenSpec change. Claude must create a missing change with
`openspec new change <change-name>` or the OpenSpec propose flow. Do not ask the
user to create the change.

L3 requires `CHECKPOINT APPROVE RISK <change-name>` before Checkpoint 2. L4
cannot receive implementation authorization. If `risk.json` is deleted,
malformed, or changed after approval, repair it and repeat the required
approvals before implementation continues.

## Runtime Reality Check

Claude Code plugin installation alone does not prove Superpowers is active in
the current session. This project installs local skills and a SessionStart hook,
but ordinary natural-language auto-triggering can still vary by Claude Code
runtime. A working session should recognize:

- `/using-superpowers`
- `/brainstorming`
- `/test-driven-development`
- `/verification-before-completion`

If these return `Unknown skill`, use the local `.claude/skills/*/SKILL.md`
files as instructions. Tell the user the workflow is running in manual
Superpowers-compatible mode, then continue the OpenSpec and checkpoint workflow.

## OpenSpec Commands

Useful Claude slash commands after initialization:

- `/opsx:propose`
- `/opsx:apply`
- `/opsx:archive`
- `/opsx:explore`

If slash commands are unavailable, use the equivalent OpenSpec CLI commands and
local OpenSpec skills.
