import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PriorityFilter } from '../components/PriorityFilter'

const mockSetFilterPriority = vi.fn()

vi.mock('../hooks/useTaskContext', () => ({
  useTaskContext: () => ({ filterPriority: 'all', setFilterPriority: mockSetFilterPriority }),
}))

describe('PriorityFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all filter buttons', () => {
    render(<PriorityFilter />)
    expect(screen.getByText('全部')).toBeInTheDocument()
    expect(screen.getByText('高优先级')).toBeInTheDocument()
    expect(screen.getByText('中优先级')).toBeInTheDocument()
    expect(screen.getByText('低优先级')).toBeInTheDocument()
  })

  it('calls setFilterPriority on click', async () => {
    const user = userEvent.setup()
    render(<PriorityFilter />)
    await user.click(screen.getByText('高优先级'))
    expect(mockSetFilterPriority).toHaveBeenCalledWith('high')
  })
})
