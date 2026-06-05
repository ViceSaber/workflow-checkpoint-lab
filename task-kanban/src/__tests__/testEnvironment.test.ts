import { describe, expect, it } from 'vitest'

describe('test environment', () => {
  it('provides the jsdom localStorage implementation', () => {
    expect(typeof localStorage.clear).toBe('function')
    expect(typeof localStorage.getItem).toBe('function')
    expect(typeof localStorage.setItem).toBe('function')
  })
})
