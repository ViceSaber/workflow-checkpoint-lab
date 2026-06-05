# Implementation Plan

1. Refresh `.ai-workflow-bootstrap-version` to match AI Workflow Bootstrap 0.1.1.
2. Keep script/template updates limited to files produced by the bootstrap initializer.
3. Verify checkpoint scripts with controlled smoke inputs.
4. Run local project checks from `task-kanban/`.
5. Push the branch, open a PR, wait for the required `task-kanban` GitHub Actions check, then merge through protected `main`.
