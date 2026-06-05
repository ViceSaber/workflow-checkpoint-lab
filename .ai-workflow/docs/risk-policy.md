# AI Change Risk Policy

Classify each non-mechanical task before implementation. Record the risk level
in the implementation plan and final delivery summary. When uncertain, use the
higher level and ask for confirmation.

## Risk Declaration

Every OpenSpec change must include:

```text
openspec/changes/<change-name>/risk.json
```

The agent creates and maintains this file. The user should not need to write it.

```json
{
  "level": "L2",
  "reasons": ["User-visible workflow change"],
  "higherRiskExclusions": [
    "No authentication or authorization changes",
    "No production configuration changes"
  ],
  "profiles": ["react-frontend"],
  "rollback": "Revert the feature commit"
}
```

- `level` must be `L0`, `L1`, `L2`, `L3`, or `L4`.
- `reasons` must explain why the selected level applies.
- `higherRiskExclusions` must explain why higher levels do not apply for
  `L0` through `L3`.
- `profiles` records active profile policies for human review. V1 does not
  automatically derive or raise the level from this metadata.
- `rollback` must state how to undo the change.

Checkpoint 1 records a canonical fingerprint of `risk.json`. If its effective
content changes or the file is deleted, implementation authorization becomes
invalid until the agent rebuilds the declaration and the user re-approves the
required checkpoints.

## L0: Documentation And Test Assets

Examples:

- documentation
- comments
- test cases and test fixtures
- local mock data
- assessment reports

Action:

- Record the classification for observation.
- V1 intentionally keeps the standard checkpoint path. No automatic fast path
  is enabled yet.

## L1: Low-Risk Code Change

Examples:

- logging additions
- small null guards
- local refactors with no intended behavior change
- non-core utility changes

Action:

- Include the files and verification commands in the implementation plan.
- Execute after the normal workflow approval required by `AI_WORKFLOW.md`.

## L2: Behavior-Changing Modification

Examples:

- API validation behavior
- service branching logic
- exception handling behavior
- persistence query conditions
- user-visible workflow changes

Action:

- Complete Checkpoint 1 and Checkpoint 2 before implementation.
- Record behavior impact, compatibility risk, tests, and rollback notes.

## L3: High-Risk Change

Examples:

- authentication or authorization
- encryption
- SQL injection remediation
- transaction boundaries
- dependency upgrades
- financial calculation
- core workflow state changes

Action:

- Produce a proposal, risk analysis, and exact planned diff.
- Wait for `CHECKPOINT APPROVE RISK <change-name>` before Checkpoint 2.
- Do not treat ordinary Checkpoint approval as task-specific approval.

## L4: Prohibited Direct Change

Examples:

- production credentials
- production deployment configuration
- direct production data repair
- payment or settlement rules
- bulk rewrite across modules

Action:

- Analysis and remediation proposal only.
- Do not apply executable changes.
