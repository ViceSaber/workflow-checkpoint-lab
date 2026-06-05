# Design

## Approach

Run the existing bootstrap initializer against the project and keep the resulting public change limited to version metadata plus this OpenSpec smoke record.

## Workflow Script Coverage

The smoke chain validates:

- Checkpoint 1 records only after `openspec validate <change> --strict` passes.
- Checkpoint 2 records after `implementation-scope.json` is present and risk state is unchanged.
- The implementation gate allows only targets inside the approved scope.
- The Stop hook blocks final delivery until Checkpoint 3 is recorded.
- CI executes lint, tests, and build through GitHub Actions before merge.

## Rollback

Revert the pull request that changes `.ai-workflow-bootstrap-version` and removes this smoke OpenSpec change.
