# AI Development Workflow

This repository uses a fused workflow:

- OpenSpec manages requirements, changes, task artifacts, validation, and archive.
- Superpowers manages disciplined execution: brainstorming, planning, TDD,
  debugging, review, and completion verification.
- Three checkpoints require explicit human approval before moving forward.

## Source Of Truth

Use OpenSpec-native structure:

```text
openspec/
  specs/
  changes/
    <change-name>/
      proposal.md
      design.md
      risk.json
      specs/**/spec.md
      tasks.md
```

Do not create a parallel `specs/<project>/` workflow unless the user explicitly
asks for a non-OpenSpec process.

## Trigger

Use this workflow for:

- new features
- behavior changes
- bug fixes
- refactors that affect behavior or public interfaces
- new integrations, commands, workflows, or UI surfaces

For tiny mechanical edits, direct user instructions may override the full
checkpoint flow. Mention skipped checkpoints in the final response.

## Checkpoint Commands

Use these exact commands as the complete user message:

- `CHECKPOINT SELECT <change-name>`
- `CHECKPOINT APPROVE 1 <change-name>`
- `CHECKPOINT APPROVE RISK <change-name>`
- `CHECKPOINT APPROVE 2 <change-name>`
- `CHECKPOINT APPROVE 3 <change-name>`
- `CHECKPOINT PAUSE <change-name>`
- `CHECKPOINT CLOSE <change-name>`

Select the intended change before approval when multiple OpenSpec changes are
active or when switching between changes. An approval command also selects its
named change. Approval commands also automatically pause the current active change without deleting its artifacts or approvals. Generic replies such as
`Proceed` or `Approved, continue` do not change checkpoint state. If approval is
unclear, stop and ask for the exact command. After final delivery, close the
completed change. Closing resets its local approval and removes its active
selection so a later task cannot inherit implementation permission.

`CHECKPOINT PAUSE <change-name>` clears the active selection but preserves all
checkpoint approvals and risk state. Use PAUSE to temporarily set aside work on
one change. `CHECKPOINT SELECT` automatically pauses the current active change
before switching, so switching does not require closing or losing progress.

`CHECKPOINT SELECT <change-name>` only selects an existing OpenSpec change. It
never creates an OpenSpec change. The agent must create a missing change with
`openspec new change <change-name>` or the OpenSpec propose skill. Do not ask the
user to create the change.

### One Active Change Per Workspace

One workspace directory supports one selected active change at a time. Do not
run concurrent implementation work for multiple changes in the same directory;
use a separate git worktree for concurrent work. `CHECKPOINT PAUSE` and
`CHECKPOINT SELECT` may change the selected active change, but they do not delete
or archive OpenSpec artifacts. Closing an unapproved change only clears the
active selection; it does not delete or archive OpenSpec artifacts.

## Phase 0: Context And Skill Selection

1. Read this file and the relevant OpenSpec files.
2. Read `.ai-workflow/docs/risk-policy.md`,
   `.ai-workflow/docs/security-baseline.md`,
   `.ai-workflow/docs/context-budget-policy.md`,
   `.ai-workflow/docs/profiles.md`, and each active profile document listed by
   the manifest.
3. Classify the task with `.ai-workflow/docs/risk-policy.md`. Apply the stricter
   rule when an active stack or domain profile raises the required risk level.
4. Create or update `openspec/changes/<change-name>/risk.json`. Include reasons,
   exclusions for higher levels, active profile metadata, and rollback.
5. Verify OpenSpec is installed with `openspec --version`.
6. Check active changes with `openspec list`.
7. Confirm the current agent can invoke the relevant OpenSpec local skills.
8. Confirm project-local Superpowers skill files exist. Claude Code and Codex
   should get the local Superpowers bootstrap from their project-level
   SessionStart hooks. If runtime slash/skill invocation or ordinary
   natural-language triggering is unavailable, read the relevant `SKILL.md`
   file manually and state that the session is running in manual
   Superpowers-compatible mode.
9. If the task is creative or changes behavior, use Superpowers `brainstorming`
   before implementation.
10. If there is already an active relevant OpenSpec change, continue it. Otherwise
   the agent must create a new change with `openspec new change <change-name>` or
   the OpenSpec propose skill. Do not delegate change creation to the user.
11. When multiple OpenSpec changes exist, ask the user to select the intended
   change with `CHECKPOINT SELECT <change-name>`.
12. Do not infer the active change from the number of OpenSpec changes. Source
    writes require an explicitly selected and approved active change.

## Checkpoint 1: Specification Approval

Goal: agree on what will be built before implementation planning.

Required actions:

1. Use Superpowers `brainstorming` to clarify the requirement.
2. Create or update an OpenSpec change:
   - `openspec new change <change-name>` or the OpenSpec propose skill
   - `proposal.md`
   - `design.md`
   - `risk.json`
   - `.openspec.yaml` when OpenSpec creates or requires it
   - `specs/**/spec.md`
   - `tasks.md`
   Do not include `implementation-scope.json`, `implementation-plan.md`,
   `test-plan.md`, or `risk-notes.md` in the same write or patch as
   Checkpoint 1 preparation artifacts. Those are implementation planning
   artifacts and must wait until Checkpoint 1 is approved.
3. Review `risk.json` with the user. State the selected risk level, reasons,
   exclusions for higher levels, active profile metadata, and rollback.
4. Ensure specs use OpenSpec requirements and scenarios:
   - Wrap delta specs under the applicable heading:
     - `## ADDED Requirements`
     - `## MODIFIED Requirements`
     - `## REMOVED Requirements`
   - `### Requirement: <name>`
   - `#### Scenario: <name>`
   - `WHEN` / `THEN`
5. Run `openspec status --change <change-name>`.
6. Run `openspec validate <change-name> --strict`.
7. If OpenSpec validation fails, stop and fix the OpenSpec artifacts. Do not continue to checkpoint approval, and do not tell the user validation is non-blocking.
8. Stop and ask for approval.

Stop message:

```text
Checkpoint 1 ready. Please review and approve the OpenSpec change before implementation planning.
Reply with: CHECKPOINT APPROVE 1 <change-name>
```

Forbidden before approval:

- implementation code
- dependency additions
- external service integration
- database/schema changes
- large refactors
- scope expansion

## Checkpoint 2: Implementation Plan Approval

Goal: agree on how the approved specification will be implemented before coding.

Required actions:

1. Use Superpowers `writing-plans`.
2. Refine `openspec/changes/<change-name>/tasks.md` into small verifiable tasks.
3. Document test approach in the design or tasks file when needed.
4. Identify risks, rollback strategy, and files likely to change.
5. Create `openspec/changes/<change-name>/implementation-scope.json`. This is
   the mechanical Checkpoint 2 authorization boundary. Include only the files,
   directories, or globs required for the approved change. For large shared
   files, add `anchors` for the functions, DOM IDs, CSS classes, or other text
   anchors the implementation is allowed to touch.

   ```json
   {
     "allowedFiles": ["src/App.tsx"],
     "allowedDirs": [],
     "allowedGlobs": [],
     "anchors": {
       "src/App.tsx": ["TaskList", "priority-filter"]
     }
   }
   ```

   If a change has no safe anchor-level boundary, say so in the plan and keep
   the file list as narrow as possible.
6. Record the task risk level and any stack or domain profile rule that raises
   the required approval level.
7. Identify the project's verification commands before coding:
   - test command
   - lint or static-analysis command, or explicitly note its absence
   - build or type-check command, or explicitly note its absence
8. Record these commands in the implementation plan.
9. Follow `.ai-workflow/docs/context-budget-policy.md`. Build a file map with
   read-only discovery commands before broad reading. Record a Context Review in
   the implementation plan:
   - file map
   - full-read files and reasons
   - selective-read files
   - files intentionally excluded
   - estimated context risk
   - Context Plan when any policy threshold is reached
10. Stop and ask for approval.

For `L3`, request task-specific approval before Checkpoint 2:

```text
L3 risk approval required. Please review the risk analysis and exact planned diff.
Reply with: CHECKPOINT APPROVE RISK <change-name>
```

For `L4`, stop after analysis and remediation planning. Do not request
Checkpoint 2 and do not modify implementation files.

Stop message:

```text
Checkpoint 2 ready. Please review and approve the implementation plan before coding.
Reply with: CHECKPOINT APPROVE 2 <change-name>
```

Forbidden before approval:

- source code changes
- production credentials
- external API integration
- unapproved behavior changes

## Implementation Phase

After Checkpoint 2 approval:

1. If git is available, use Superpowers `using-git-worktrees` where practical.
   If git is not available, skip branch/worktree steps and continue.
2. Use OpenSpec apply flow or read `openspec instructions apply --change <change-name> --json`.
3. Use Superpowers `test-driven-development` for feature and bug-fix code.
4. Use Superpowers `systematic-debugging` for failures.
5. Use Superpowers `dispatching-parallel-agents` or `subagent-driven-development`
   for independent tasks when available.
6. Mark OpenSpec task checkboxes complete as tasks are finished.
7. Keep changes within the approved OpenSpec scope and the approved
   `implementation-scope.json` boundary. If a target file, directory, or anchor
   is missing from the scope, stop and update the scope before asking for
   Checkpoint 2 re-approval.
8. If `risk.json` is deleted, malformed, or changed, stop implementation. Repair
   the declaration and repeat Checkpoint 1. For `L3`, repeat task-specific risk
   approval before Checkpoint 2.
9. If `implementation-scope.json` is deleted, malformed, or changed, stop
   implementation and repeat Checkpoint 2 before implementation continues.

## Checkpoint 3: Final Delivery Review

Before requesting final acceptance:

1. Use Superpowers `verification-before-completion`.
2. Run `openspec validate <change-name>` for active OpenSpec changes.
3. Run the project test command.
4. Run the project's lint or static-analysis command. If no such command exists,
   explicitly report its absence.
5. Run the project's build or type-check command. If no such command exists,
   explicitly report its absence.
6. Report every verification command and its actual result.
7. Use Superpowers `finishing-a-development-branch` when git is available.
8. Summarize:
   - implemented changes
   - risk level and applicable profile policies
   - test command and result
   - lint or static-analysis result
   - build or type-check result
   - OpenSpec validation result
   - acceptance criteria status
   - known limitations
   - next steps

Do not claim completion without verification evidence. If verification could not
be run, state exactly why.

Stop and ask for final acceptance:

```text
Checkpoint 3 ready. Please review the delivery evidence and acceptance criteria.
Reply with: CHECKPOINT APPROVE 3 <change-name>
```

After the user approves Checkpoint 3, ask the user to revoke the completed local
authorization:

```text
Checkpoint 3 approved. Close the completed local workflow authorization before starting another task.
Reply with: CHECKPOINT CLOSE <change-name>
```

Checkpoint 3 approval records human acceptance. It does not replace the
verification evidence above and does not automatically run project-specific
test, lint, build, or manual UI checks.
The local Stop hook also reminds Claude/Codex to request Checkpoint 3 when a
change has Checkpoint 2 approval but not final acceptance.

## Scope Control

Do not add these unless the approved OpenSpec change explicitly includes them:

- real external API integrations
- authentication flows
- database persistence
- deployment pipelines
- background workers
- cloud infrastructure
- paid services
- automatic sending of emails or messages
- production secrets or credentials

Prefer mock data and local execution for early demos.
