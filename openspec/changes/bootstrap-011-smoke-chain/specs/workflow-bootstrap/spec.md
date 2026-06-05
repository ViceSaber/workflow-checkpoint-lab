# Workflow Bootstrap Spec

## MODIFIED Requirements

### Requirement: Installed Bootstrap Version Metadata
The repository SHALL record the installed workflow bootstrap version in `.ai-workflow-bootstrap-version`.

#### Scenario: Metadata reflects the current bootstrap release
- Given the project has been refreshed with AI Workflow Bootstrap 0.1.1
- When a team member reads `.ai-workflow-bootstrap-version`
- Then the file contains `0.1.1`

### Requirement: Workflow Smoke Verification
The repository SHALL include a small smoke change that verifies the local workflow scripts and remote CI gate for the current bootstrap release.

#### Scenario: Smoke chain validates the workflow gate
- Given the smoke change is active
- When the checkpoint scripts, OpenSpec validation, local project checks, and GitHub Actions run
- Then the change can be merged only after the required CI check passes
