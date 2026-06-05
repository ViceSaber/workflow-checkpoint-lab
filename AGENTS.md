# AGENTS.md

You are working in this repository as an AI coding agent.

This project uses the canonical workflow in `AI_WORKFLOW.md`.
Read these files before starting any task:

- `AI_WORKFLOW.md`
- `RISK_POLICY.md`
- `SECURITY_BASELINE.md`
- `CONTEXT_BUDGET_POLICY.md`
- `AI_PROFILES.md`

`AI_PROFILES.md` lists the active stack and domain policy documents. Read each
listed document before planning implementation.

## Required Stack

- OpenSpec: specs, change proposals, implementation tasks, validation, archive.
- Superpowers: brainstorming, planning, TDD, debugging, review, verification.
- Three checkpoints: human approval before planning, before coding, and before
  final handoff.

## Core Rules

1. Treat `AI_WORKFLOW.md` as the source of truth for process.
2. Treat `openspec/` as the source of truth for requirements and active changes.
3. For feature work, behavior changes, or bug fixes, start with OpenSpec and
   relevant Superpowers skills before implementation.
4. Classify the task with `RISK_POLICY.md` before implementation. Apply the
   stricter rule when a stack or domain profile raises the required level.
5. Do not write implementation code before Checkpoint 1 and Checkpoint 2 are
   approved, unless the user explicitly says to skip checkpoints for this task.
6. Use OpenSpec-native paths:
   - `openspec/changes/<change-name>/proposal.md`
   - `openspec/changes/<change-name>/design.md`
   - `openspec/changes/<change-name>/risk.json`
   - `openspec/changes/<change-name>/implementation-scope.json`
   - `openspec/changes/<change-name>/specs/**/spec.md`
   - `openspec/changes/<change-name>/tasks.md`
7. Run `openspec validate <change-name>` before final delivery when a change is
   active.
8. Run the project test command before claiming implementation is complete.
9. If instructions conflict, follow the latest direct user instruction unless it
   conflicts with system/developer policy, and mention the skipped process step.
10. For Claude Code and Codex checkpoint state, use exact complete-message
    commands:
   - `CHECKPOINT SELECT <change-name>`
   - `CHECKPOINT APPROVE 1 <change-name>`
   - `CHECKPOINT APPROVE RISK <change-name>`
   - `CHECKPOINT APPROVE 2 <change-name>`
   - `CHECKPOINT APPROVE 3 <change-name>`
   - `CHECKPOINT PAUSE <change-name>`
   - `CHECKPOINT CLOSE <change-name>`
   Generic continuation phrases do not approve checkpoints.
   Approval commands also automatically pause the current active change without deleting its artifacts or approvals.
   `CHECKPOINT PAUSE <change-name>` clears the active selection but preserves
   all checkpoint approvals and risk state. `CHECKPOINT SELECT` automatically
   pauses the current active change before switching.
   One workspace directory supports one selected active change at a time. Use a
   separate git worktree for concurrent work instead of running multiple
   implementation tasks in the same directory.
   L3 requires task-specific risk approval before Checkpoint 2. L4 cannot
   receive implementation authorization.
   Checkpoint 1 requires passing OpenSpec validation. If `openspec validate
   <change-name> --strict` fails, fix the OpenSpec artifacts before asking for
   approval; do not continue to checkpoint approval and do not describe
   validation as non-blocking.
   Checkpoint 2 requires `implementation-scope.json`; its allowed files,
   directories, globs, and optional anchors are the mechanical implementation
   boundary. If the required target or anchor is not listed, update the scope
   and repeat Checkpoint 2 before coding.
   `CHECKPOINT SELECT <change-name>` only selects an existing OpenSpec change;
   it never creates one. The agent must create a missing change with
   `openspec new change <change-name>` or the OpenSpec propose skill. Do not ask
   the user to create it.
   After presenting verification evidence, wait for Checkpoint 3 approval.
   Then close the completed change so its implementation approval cannot leak
   into the next task.

## Session Startup Check

At the start of a coding task in this repository:

1. Verify OpenSpec is available with `openspec --version`.
2. Verify this project is initialized with `openspec list`.
3. Verify local OpenSpec skills exist under `.codex/skills` or `.claude/skills`
   for the current agent.
4. Verify project-local Superpowers skills exist under `.codex/skills` or
   `.claude/skills`. Project-local SessionStart hooks should inject the
   Superpowers bootstrap for Claude Code and Codex at startup, clear, and
   compact events. If runtime skill invocation or automatic triggering is
   unavailable, read the relevant local `SKILL.md` files and state that the
   session is using manual Superpowers-compatible mode.
5. Read `RISK_POLICY.md`, `SECURITY_BASELINE.md`, `CONTEXT_BUDGET_POLICY.md`,
   `AI_PROFILES.md`, and each active profile document listed by the manifest.
6. Before broad file reading, follow `CONTEXT_BUDGET_POLICY.md`. Build a file
   map with read-only discovery commands first, then full-read only files needed
   for the approved planning scope.
7. Create and review `openspec/changes/<change-name>/risk.json`. If it changes
   after approval, stop implementation and repeat the required approvals.
8. Before Checkpoint 2, create and review
   `openspec/changes/<change-name>/implementation-scope.json`. If it changes
   after Checkpoint 2, stop implementation and repeat Checkpoint 2.

## Tooling Notes

- If OpenSpec local skills are available, prefer them for propose/apply/archive
  flows.
- Superpowers is required for the full workflow. If runtime invocation is
  unavailable, do not pretend the Superpowers steps ran; read the local skill
  instructions manually and continue in manual Superpowers-compatible mode
  unless the user asks to continue OpenSpec-only.
- If git is not initialized, skip Superpowers worktree/branch/commit steps and
  continue with the rest of the workflow.
