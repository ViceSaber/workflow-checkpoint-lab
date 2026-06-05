# Context Budget Policy

Use this policy during codebase exploration and implementation planning. The
goal is to understand enough context to produce an accurate plan without
full-reading broad file sets by default.

## Default Sequence

1. Build a file map with read-only discovery commands.
2. Identify likely modified files, directly related tests, required
   configuration files, and direct dependencies.
3. Read selectively before full-reading files.
4. Explain why each full file read is necessary.
5. Split broad assessments into modules and evaluate them in stages.

## Reading Classes

### A: Full Read

Full-read only when necessary:

- files likely to be modified;
- directly related tests;
- small configuration files required for implementation or verification;
- direct dependencies whose behavior cannot be understood from interfaces.

### B: Selective Read

Prefer targeted excerpts, exports, signatures, selectors, and key functions for:

- related components;
- shared types;
- hooks and context providers;
- service, mapper, and utility dependencies;
- callers and callees outside the immediate change.

### C: Structural Summary

Use file maps, searches, line counts, and excerpts instead of full reads for:

- large CSS files unless the task is a global style change;
- historical tests unrelated to the requested behavior;
- large utility classes;
- mapper XML files;
- unrelated modules and documentation.

### D: Exclude By Default

Do not read unless the task explicitly requires it:

- dependency directories such as `node_modules/`;
- generated code;
- build outputs such as `dist/`, `build/`, and `target/`;
- lock files;
- logs;
- large data files;
- binary files and images.

## Read-Only Discovery Commands

Before Checkpoint 2 approval, use safe discovery commands where useful:

- `ls`
- `find`
- `tree`
- `rg`
- `grep`
- `wc -l`
- `head`
- `tail`
- `git status --short`
- `git diff --name-only`
- `git log --oneline -5`

Discovery commands must not modify files, install packages, execute nested
commands, call production services, or write output files.

## Context Plan Thresholds

Before continuing, stop and provide a Context Plan if exploration is expected
to meet any threshold:

- Full-read more than 8 files.
- Accumulate more than 3,000 lines of full-read content.
- A single file exceeds 1,000 lines and a full read is considered.
- Estimated context exceeds 50k tokens before implementation planning is
  complete.

The Context Plan must list:

- files already read;
- files still needed;
- why each additional full read is necessary;
- files intentionally excluded;
- estimated context risk;
- a reduced-context strategy.

Wait for user confirmation before broadening the read scope.

