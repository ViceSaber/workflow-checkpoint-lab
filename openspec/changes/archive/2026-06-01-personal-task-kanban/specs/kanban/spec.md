# Spec: Personal Task Kanban

## ADDED Requirements

### Requirement: Task CRUD

#### Scenario: Create a new task

WHEN the user clicks the "New Task" button
AND fills in title (required), description, and priority
AND submits the form
THEN a new task is created with status "todo" and appears in the Todo column

#### Scenario: Edit an existing task

WHEN the user clicks the edit button on a task card
AND modifies the title, description, or priority
AND submits the form
THEN the task is updated with the new values

#### Scenario: Delete a task

WHEN the user clicks the delete button on a task card
AND confirms the deletion in the dialog
THEN the task is removed from the board

### Requirement: Status Management

#### Scenario: Change task status

WHEN the user selects a different status on a task card
THEN the task moves to the corresponding column
AND the task counts update

#### Scenario: Done tasks visual treatment

WHEN a task has status "done"
THEN the task card title shows a strikethrough
AND the card has reduced opacity

### Requirement: Filtering

#### Scenario: Filter by status

WHEN the user clicks a status tab (Todo / In Progress / Done)
THEN only tasks in that status are shown
AND other columns are hidden or de-emphasized

WHEN the user clicks "All"
THEN all three columns are shown

#### Scenario: Search by keyword

WHEN the user types in the search input
THEN tasks are filtered in real-time by matching title or description (case-insensitive)
AND only matching tasks appear in their columns

### Requirement: Task Counts

#### Scenario: Display counts per status

WHEN the board is rendered
THEN each column header shows the count of tasks in that status
AND counts update in real-time when tasks change

### Requirement: Data Persistence

#### Scenario: Persist across page refresh

WHEN the user creates, edits, or deletes a task
THEN the task data is saved to localStorage immediately

WHEN the user refreshes or reopens the page
THEN all tasks are restored from localStorage

### Requirement: Priority Display

#### Scenario: Priority color indicator

WHEN a task has priority "high"
THEN the card shows a red left border

WHEN a task has priority "medium"
THEN the card shows an amber left border

WHEN a task has priority "low"
THEN the card shows a green left border
