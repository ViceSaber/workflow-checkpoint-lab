# Design: UI Redesign

See `docs/superpowers/specs/2026-06-02-ui-redesign-design.md` for the complete design specification.

## Key Decisions

1. **Approach A: Incremental CSS Rewrite** — keep pure CSS, no new dependencies
2. **Decorative sidebar** — visual-only navigation, no routing
3. **Preset avatars** — 5 predefined assignees with gradient colors
4. **Dark color system** — Navy backgrounds (#12151a, #1a1d23, #1e2228) with purple accent (#6c5ce7)
5. **Backward compatible** — new Task fields (dueDate, assignee, tags) are all optional
