import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProgressBar } from '../components/ProgressBar'

describe('ProgressBar', () => {
  it('shows done/total label', () => {
    render(<ProgressBar done={2} total={5} />)
    expect(screen.getByText('2/5')).toBeInTheDocument()
  })

  it('renders fill with correct width', () => {
    const { container } = render(<ProgressBar done={3} total={4} />)
    const fill = container.querySelector('.progress-fill') as HTMLElement
    expect(fill.style.width).toBe('75%')
  })
})
