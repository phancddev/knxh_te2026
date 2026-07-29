export function normalizeVietnamese(value) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('vi')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function createAnswerChecker(answer) {
  const expected = String(answer ?? '').toLocaleLowerCase('vi')
  if (!expected) {
    throw new Error('QUIZ_ANSWER must be configured')
  }

  return (candidate) => {
    const submitted = String(candidate ?? '').toLocaleLowerCase('vi')
    return submitted === expected
  }
}
