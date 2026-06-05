import { useRef, useCallback } from 'react'
import { marked } from 'marked'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

interface ToolbarAction {
  label: string
  prefix: string
  suffix: string
  block?: boolean
}

const TOOLBAR_GROUPS: ToolbarAction[][] = [
  [
    { label: 'B', prefix: '**', suffix: '**' },
    { label: 'I', prefix: '_', suffix: '_' },
    { label: 'S', prefix: '~~', suffix: '~~' },
  ],
  [
    { label: 'H1', prefix: '# ', suffix: '', block: true },
    { label: 'H2', prefix: '## ', suffix: '', block: true },
    { label: 'H3', prefix: '### ', suffix: '', block: true },
  ],
  [
    { label: 'UL', prefix: '- ', suffix: '', block: true },
    { label: 'OL', prefix: '1. ', suffix: '', block: true },
    { label: '{}', prefix: '`', suffix: '`' },
    { label: '🔗', prefix: '[', suffix: '](url)' },
  ],
  [
    { label: '☐ 子任务', prefix: '- [ ] ', suffix: '', block: true },
  ],
]

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const html = marked.parse(value || '', { async: false }) as string

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  const insert = useCallback(
    (action: ToolbarAction) => {
      const ta = textareaRef.current
      if (!ta) return
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const selected = value.substring(start, end)

      let insertText: string
      if (action.block && start > 0 && value[start - 1] !== '\n') {
        insertText = '\n' + action.prefix + selected + action.suffix
      } else {
        insertText = action.prefix + selected + action.suffix
      }

      const newVal = value.substring(0, start) + insertText + value.substring(end)
      onChange(newVal)

      const cursorOffset = action.prefix.length + (insertText.startsWith('\n') ? 1 : 0)
      requestAnimationFrame(() => {
        ta.focus()
        ta.selectionStart = ta.selectionEnd = start + cursorOffset
      })
    },
    [value, onChange]
  )

  return (
    <div className="md-editor">
      <div className="md-toolbar">
        {TOOLBAR_GROUPS.map((group, gi) => (
          <span key={gi} className="md-toolbar-group">
            {group.map((action) => (
              <button
                key={action.label}
                type="button"
                className="md-toolbar-btn"
                onClick={() => insert(action)}
                title={action.label}
              >
                {action.label}
              </button>
            ))}
          </span>
        ))}
      </div>
      <div className="md-panes">
        <textarea
          ref={textareaRef}
          className="md-input"
          value={value}
          onChange={handleInput}
          placeholder="用 Markdown 编写任务描述..."
        />
        <div
          className="md-preview"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
