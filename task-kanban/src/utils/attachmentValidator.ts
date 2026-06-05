const MAX_FILE_SIZE = 500 * 1024
const MAX_TOTAL_SIZE = 2 * 1024 * 1024

interface FileLike {
  size: number
}

export function validateAttachment(
  file: FileLike,
  existingAttachments: FileLike[]
): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: '文件大小超过限制（最大 500KB）' }
  }
  const totalExisting = existingAttachments.reduce((sum, a) => sum + a.size, 0)
  const total = totalExisting + file.size
  if (total > MAX_TOTAL_SIZE) {
    return { valid: false, error: '附件总大小超过限制（最大 2MB）' }
  }
  return { valid: true }
}