import { describe, it, expect } from 'vitest'
import { validateAttachment } from '../attachmentValidator'

describe('validateAttachment', () => {
  it('accepts a file under the single-file limit', () => {
    const result = validateAttachment({ size: 400 * 1024 }, [])
    expect(result.valid).toBe(true)
  })

  it('rejects a file over 500KB', () => {
    const result = validateAttachment({ size: 600 * 1024 }, [])
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/500/)
  })

  it('rejects when total attachments exceed 2MB', () => {
    const existing = [{ size: 1800 * 1024 }]
    const result = validateAttachment({ size: 300 * 1024 }, existing)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/2MB/)
  })

  it('accepts when total is exactly at limit', () => {
    const existing = [{ size: 1536 * 1024 }]
    const result = validateAttachment({ size: 500 * 1024 }, existing)
    expect(result.valid).toBe(true)
  })
})