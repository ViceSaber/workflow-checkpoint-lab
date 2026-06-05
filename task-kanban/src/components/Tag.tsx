import type { TagName } from '../types'
import { TAG_COLORS } from '../constants/tags'

interface TagProps {
  name: TagName
}

export function Tag({ name }: TagProps) {
  const colors = TAG_COLORS[name]
  return (
    <span className="tag" style={{ backgroundColor: colors.bg, color: colors.text }}>
      {name}
    </span>
  )
}
