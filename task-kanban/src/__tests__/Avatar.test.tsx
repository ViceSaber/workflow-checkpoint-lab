import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Avatar } from '../components/Avatar'

describe('Avatar', () => {
  it('renders the initial letter', () => {
    render(<Avatar initial="张" color="pink" />)
    expect(screen.getByText('张')).toBeInTheDocument()
  })

  it('applies the color class', () => {
    const { container } = render(<Avatar initial="李" color="blue" />)
    const el = container.firstChild as HTMLElement
    expect(el.classList.contains('avatar-blue')).toBe(true)
  })

  it('renders small size when specified', () => {
    const { container } = render(<Avatar initial="王" color="green" size="sm" />)
    const el = container.firstChild as HTMLElement
    expect(el.classList.contains('avatar-sm')).toBe(true)
  })
})
