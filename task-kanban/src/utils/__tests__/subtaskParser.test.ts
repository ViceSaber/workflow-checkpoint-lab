import { describe, it, expect } from 'vitest'
import { parseSubtasks, toggleSubtask, subtaskLine } from '../subtaskParser'

describe('parseSubtasks', () => {
  it('extracts subtasks from markdown lines', () => {
    const md = '## Tasks\n- [x] Design mockup\n- [ ] Build API\n- [ ] Write tests\nSome text'
    const result = parseSubtasks(md)
    expect(result).toHaveLength(3)
    expect(result[0].text).toBe('Design mockup')
    expect(result[0].done).toBe(true)
    expect(result[1].text).toBe('Build API')
    expect(result[1].done).toBe(false)
  })

  it('returns empty array when no subtask lines exist', () => {
    expect(parseSubtasks('hello world')).toEqual([])
  })

  it('handles uppercase X in checkbox', () => {
    const result = parseSubtasks('- [X] Done thing')
    expect(result).toHaveLength(1)
    expect(result[0].done).toBe(true)
  })
})

describe('toggleSubtask', () => {
  it('toggles a subtask from unchecked to checked in markdown', () => {
    const md = '- [ ] Build API'
    const result = toggleSubtask(md, 0)
    expect(result).toBe('- [x] Build API')
  })

  it('toggles a subtask from checked to unchecked in markdown', () => {
    const md = '- [x] Build API'
    const result = toggleSubtask(md, 0)
    expect(result).toBe('- [ ] Build API')
  })

  it('toggles the correct subtask when multiple exist', () => {
    const md = '- [x] First\n- [ ] Second\n- [ ] Third'
    const result = toggleSubtask(md, 1)
    expect(result).toBe('- [x] First\n- [x] Second\n- [ ] Third')
  })
})

describe('subtaskLine', () => {
  it('generates an unchecked subtask line', () => {
    expect(subtaskLine('New task', false)).toBe('- [ ] New task')
  })

  it('generates a checked subtask line', () => {
    expect(subtaskLine('Done task', true)).toBe('- [x] Done task')
  })
})