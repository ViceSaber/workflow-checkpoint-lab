# AI Security Baseline

These rules apply to every stack and domain profile.

## Secrets And Credentials

- Do not hardcode, paste, or echo credentials, API keys, tokens, private keys,
  certificates, database passwords, or production connection strings.
- When reporting an existing secret, record only the file path, line number,
  secret category, and a redacted fingerprint.
- Recommend rotation when an exposed secret is discovered.

## Production Boundaries

- Do not modify production credentials, deployment configuration, or direct
  production data repair scripts.
- Do not run destructive commands against external systems.
- Prefer local fixtures, mock services, and sandbox environments.

## Authentication And Authorization

- Treat authentication, authorization, gateway filters, permission checks, and
  token validation as L3 or L4.
- Require task-specific human approval before applying L3 changes.

## Data And Input Safety

- Do not build SQL, shell commands, templates, or HTML by concatenating
  untrusted input.
- Do not remove sanitization or validation without an approved behavior-change
  specification.
- Redact sensitive values from logs, reports, and chat output.

## Dependencies

- Document the reason, version, and compatibility risk for dependency changes.
- Treat dependency upgrades as L3 unless a stricter profile rule applies.

