## ADDED Requirements

### Requirement: Full-page task details
The system SHALL open a full-page task detail view when a user selects a kanban card and SHALL allow the user to return to the board.

#### Scenario: Open task details
- **WHEN** the user clicks the body of a task card
- **THEN** the system displays the selected task in the full-page detail view

#### Scenario: Return to board
- **WHEN** the user clicks the back control in the detail view
- **THEN** the system displays the kanban board

### Requirement: Markdown description editing
The system SHALL allow the user to edit a task description as Markdown, SHALL render a preview, and SHALL persist description changes locally.

#### Scenario: Edit Markdown description
- **WHEN** the user updates Markdown in the task detail editor
- **THEN** the system updates the rendered preview
- **AND** the system persists the Markdown source in localStorage

#### Scenario: Insert Markdown formatting
- **WHEN** the user activates a Markdown toolbar control
- **THEN** the system inserts the corresponding Markdown syntax into the editor

### Requirement: Markdown subtask checklist
The system SHALL derive subtasks from Markdown checklist lines, SHALL display completion progress, and SHALL keep preview toggles synchronized with the Markdown source.

#### Scenario: Parse checklist lines
- **WHEN** the task description contains `- [ ]` or `- [x]` Markdown lines
- **THEN** the system displays the corresponding subtasks and completion progress

#### Scenario: Toggle checklist item
- **WHEN** the user toggles a subtask checkbox in the preview
- **THEN** the system updates the corresponding Markdown checklist line
- **AND** the system persists the updated progress locally

### Requirement: Task property editing
The system SHALL allow status and priority updates from the detail sidebar and SHALL persist those changes locally.

#### Scenario: Update detail property
- **WHEN** the user changes a task status or priority in the detail sidebar
- **THEN** the system updates the task property
- **AND** the system persists the change in localStorage

### Requirement: Local comments
The system SHALL allow users to add timestamped comments with a locally remembered author name and SHALL persist comments locally.

#### Scenario: Add comment
- **WHEN** the user provides an author name and comment content and submits the comment
- **THEN** the system appends a timestamped comment to the task
- **AND** the system persists the comment in localStorage

### Requirement: Local attachments
The system SHALL allow attachment upload, download, and deletion in the detail view and SHALL enforce local storage size limits.

#### Scenario: Upload valid attachment
- **WHEN** the user uploads a file no larger than 500KB and the resulting task attachment total is no larger than 2MB
- **THEN** the system stores the attachment locally and lists it on the task

#### Scenario: Reject oversized attachment
- **WHEN** the user uploads a file larger than 500KB or the resulting task attachment total would exceed 2MB
- **THEN** the system rejects the attachment

#### Scenario: Download attachment
- **WHEN** the user activates the download control for an attachment
- **THEN** the system downloads the locally stored attachment

#### Scenario: Delete attachment
- **WHEN** the user activates the delete control for an attachment
- **THEN** the system removes the attachment from the task and localStorage

### Requirement: Detail task actions
The system SHALL allow title editing and confirmed task deletion from the detail view.

#### Scenario: Edit title
- **WHEN** the user changes the title in the detail view
- **THEN** the system updates and locally persists the task title

#### Scenario: Delete task
- **WHEN** the user confirms deletion from the detail view
- **THEN** the system removes the task and returns to the kanban board
