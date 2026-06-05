# UI Redesign Spec

## ADDED Requirements

### REQ-1: Dark Theme
The entire application uses a dark color scheme with navy backgrounds (#12151a, #1a1d23) and light text (#e1e4e8).

#### Scenario: User opens the app
- Given the app is loaded
- When the user views the kanban board
- Then all surfaces use dark backgrounds with light text

### REQ-2: Sidebar Navigation
A fixed left sidebar shows decorative navigation items (仪表盘, 项目, 任务, 日历) and user avatar.

#### Scenario: Sidebar renders
- Given the app is loaded
- Then a 240px sidebar appears on the left with nav items and user section

### REQ-3: Enriched Task Cards
Task cards display color tags, assignee avatars, subtask progress bars, and due dates with overdue detection.

#### Scenario: Task card shows all elements
- Given a task with tags, assignee, subtasks, and due date
- When the card is rendered
- Then tags, avatar, progress bar, and due date are all visible

### REQ-4: Task Form Extensions
The task creation/edit modal includes date picker, assignee selector, and tag toggles.

#### Scenario: Creating a task with new fields
- Given the user opens the new task form
- Then date picker, assignee dropdown, and tag toggle buttons are available

### REQ-5: Filter Chips
Status and priority filters use dark chip styling with purple active state.

#### Scenario: Filter chips display
- Given the filter bar renders
- Then status and priority options appear as rounded chips with active highlight
