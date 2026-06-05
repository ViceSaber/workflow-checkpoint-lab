import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Tag } from '../components/Tag'

describe('Tag', () => {
  it('renders the tag label', () => {
    render(<Tag name="设计" />)
    expect(screen.getByText('设计')).toBeInTheDocument()
  })

  it('applies correct background color', () => {
    const { container } = render(<Tag name="紧急" />)
    const el = container.firstChild as HTMLElement
    expect(el.style.backgroundColor).toBeTruthy()
  })
})
