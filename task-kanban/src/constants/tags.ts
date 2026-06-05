import type { TagName } from '../types'

export const TAG_NAMES: TagName[] = ['紧急', '设计', '开发', '功能', '优化', '营销']

export const TAG_COLORS: Record<TagName, { bg: string; text: string }> = {
  '紧急': { bg: 'rgba(232, 67, 147, 0.2)', text: '#fd79a8' },
  '设计': { bg: 'rgba(108, 92, 231, 0.2)', text: '#a29bfe' },
  '开发': { bg: 'rgba(0, 184, 148, 0.2)', text: '#55efc4' },
  '功能': { bg: 'rgba(116, 185, 255, 0.2)', text: '#74b9ff' },
  '优化': { bg: 'rgba(253, 203, 110, 0.2)', text: '#fdcb6e' },
  '营销': { bg: 'rgba(253, 203, 110, 0.2)', text: '#fdcb6e' },
}
