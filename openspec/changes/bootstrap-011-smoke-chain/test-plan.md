# Test Plan

- `openspec validate bootstrap-011-smoke-chain --strict`
- `CHECKPOINT APPROVE 1 bootstrap-011-smoke-chain` through `.codex/hooks/workflow-checkpoint-record`
- `CHECKPOINT APPROVE 2 bootstrap-011-smoke-chain` through `.codex/hooks/workflow-checkpoint-record`
- PreToolUse implementation gate smoke for `.ai-workflow-bootstrap-version`
- Stop hook denial before Checkpoint 3, then silence after Checkpoint 3
- `npm run lint`
- `npm test`
- `npm run build`
- GitHub Actions required check `task-kanban`
