import type { AvatarColor } from '../types'

interface AvatarProps {
  initial: string
  color: AvatarColor
  size?: 'sm' | 'md'
}

export function Avatar({ initial, color, size = 'md' }: AvatarProps) {
  return (
    <div className={`avatar avatar-${color} ${size === 'sm' ? 'avatar-sm' : ''}`}>
      {initial}
    </div>
  )
}
