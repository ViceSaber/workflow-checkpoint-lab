# UI Redesign Spec

## ADDED Requirements

### Requirement: Dark Theme
The application SHALL use a dark color scheme with navy backgrounds (#12151a, #1a1d23) and light text (#e1e4e8) for all surfaces.

#### Scenario: User opens the app
- Given the app is loaded
- When the user views the kanban board
- Then all surfaces use dark backgrounds with light text

### Requirement: Sidebar Navigation
The application SHALL display a fixed left sidebar with decorative navigation items and user avatar.

#### Scenario: Sidebar renders
- Given the app is loaded
- Then a 240px sidebar appears on the left with nav items and user section

### Requirement: Enriched Task Cards
Task cards SHALL display color tags, assignee avatars, subtask progress bars, and due dates with overdue detection.

#### Scenario: Task card shows all elements
- Given a task with tags, assignee, subtasks, and due date
- When the card is rendered
- Then tags, avatar, progress bar, and due date are all visible

### Requirement: Task Form Extensions
The task form SHALL include a date picker, assignee selector, and tag toggles for creating and editing tasks.

#### Scenario: Creating a task with new fields
- Given the user opens the new task form
- Then date picker, assignee dropdown, and tag toggle buttons are available

### Requirement: Filter Chips
Status and priority filters SHALL use dark chip styling with purple active state.

#### Scenario: Filter chips display
- Given the filter bar renders
- Then status and priority options appear as rounded chips with active highlight
