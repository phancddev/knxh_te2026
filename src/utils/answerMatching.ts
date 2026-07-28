const COMPACT_ALIASES = new Set([
  'sanbongchuyen',
  'bongchuyen',
  'sanbc',
  'sbc',
])

export function normalizeVietnamese(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('vi')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function levenshteinDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex]

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost,
      )
    }

    previous.splice(0, previous.length, ...current)
  }

  return previous[right.length]
}

function fuzzyTokenMatch(tokens: string[], target: string, tolerance: number): boolean {
  return tokens.some((token) => levenshteinDistance(token, target) <= tolerance)
}

export function isCorrectLocationAnswer(value: string): boolean {
  const normalized = normalizeVietnamese(value)
  if (!normalized) return false

  const compact = normalized.replace(/\s/g, '')
  if (COMPACT_ALIASES.has(compact)) return true

  if (compact.includes('sanbongchuyen') || normalized.includes('san bong chuyen')) return true

  // Chịu được khoảng hai lỗi gõ ở cả cụm, ví dụ "san bong truyen".
  if (levenshteinDistance(compact, 'sanbongchuyen') <= 2) return true

  const tokens = normalized.split(' ')
  const hasCourt = fuzzyTokenMatch(tokens, 'san', 1)
  const hasBall = fuzzyTokenMatch(tokens, 'bong', 1)
  const hasVolley = fuzzyTokenMatch(tokens, 'chuyen', 2)

  // "Bóng chuyền" vẫn đủ xác định địa điểm; từ "sân" có thể được lược bỏ.
  return hasBall && hasVolley && (hasCourt || tokens.length <= 3)
}
