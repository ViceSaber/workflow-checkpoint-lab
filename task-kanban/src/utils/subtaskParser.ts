import type { Subtask } from '../types'

const SUBTASK_RE = /^- \[([ xX])] (.+)$/

export function parseSubtasks(markdown: string): Subtask[] {
  const lines = markdown.split('\n')
  const subtasks: Subtask[] = []
  let index = 0
  for (const line of lines) {
    const match = SUBTASK_RE.exec(line.trim())
    if (match) {
      subtasks.push({
        id: `subtask-${index}`,
        text: match[2],
        done: match[1].toLowerCase() === 'x',
      })
      index++
    }
  }
  return subtasks
}

export function toggleSubtask(markdown: string, subtaskIndex: number): string {
  const lines = markdown.split('\n')
  let count = 0
  return lines
    .map((line) => {
      const trimmed = line.trim()
      const match = SUBTASK_RE.exec(trimmed)
      if (match) {
        if (count === subtaskIndex) {
          const isChecked = match[1].toLowerCase() === 'x'
          const prefix = line.substring(0, line.indexOf(trimmed))
          count++
          return `${prefix}- [${isChecked ? ' ' : 'x'}] ${match[2]}`
        }
        count++
      }
      return line
    })
    .join('\n')
}

export function subtaskLine(text: string, done: boolean): string {
  return `- [${done ? 'x' : ' '}] ${text}`
}