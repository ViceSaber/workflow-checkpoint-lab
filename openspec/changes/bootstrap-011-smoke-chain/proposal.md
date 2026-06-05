# Bootstrap 0.1.1 Smoke Chain

## Summary

Refresh the project workflow bootstrap metadata from 0.1.0 to 0.1.1 and use the change as a small end-to-end workflow smoke test.

## Motivation

The project-local workflow scripts are already aligned with the current bootstrap templates, but the installed version metadata still reports 0.1.0. The metadata should match the current bootstrap release so team members and audits can confirm the installed workflow baseline.

## Scope

- Update `.ai-workflow-bootstrap-version` to `0.1.1`.
- Validate the OpenSpec change.
- Exercise the checkpoint record, implementation gate, stop gate, local project checks, GitHub Actions, PR, and protected branch path.

## Out Of Scope

- Business UI behavior changes.
- Task data model changes.
- Auth, network, dependency, or production configuration changes.
