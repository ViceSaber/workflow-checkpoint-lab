import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DueDate } from '../components/DueDate'

describe('DueDate', () => {
  it('displays formatted date', () => {
    render(<DueDate date="2026-06-15" />)
    expect(screen.getByText('6月15日')).toBeInTheDocument()
  })

  it('shows overdue class for past date', () => {
    const past = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const { container } = render(<DueDate date={past} />)
    const el = container.querySelector('.card-date')
    expect(el?.classList.contains('overdue')).toBe(true)
  })

  it('no overdue class for future date', () => {
    const future = new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10)
    const { container } = render(<DueDate date={future} />)
    const el = container.querySelector('.card-date')
    expect(el?.classList.contains('overdue')).toBe(false)
  })
})
