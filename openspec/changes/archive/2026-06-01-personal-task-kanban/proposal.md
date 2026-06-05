# Proposal: Personal Task Kanban

## Summary

A local-first personal task kanban board. Users can create, edit, and delete tasks, switch tasks between three statuses (todo / in-progress / done), filter by status and keyword, and see task counts per status. Data persists across page refreshes via localStorage. No backend, no authentication.

## Motivation

Provide a simple, zero-setup task management tool that runs entirely in the browser.

## Scope

- React + TypeScript + Vite project setup
- Three-column kanban UI (todo / in-progress / done)
- Task CRUD with fields: title, description, status, priority
- Status filter tabs and keyword search
- localStorage persistence
- Task count display per status

## Out of Scope

- Backend / API
- User authentication
- Drag-and-drop
- Due dates or reminders
- Data export/import
