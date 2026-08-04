export const TESTING_ANSWER = 'test'

export function checkTestingAnswer(candidate) {
  return String(candidate ?? '').toLocaleLowerCase('vi') === TESTING_ANSWER
}

export function createTestingPlaceholder(mode) {
  const isReward = mode === 'full'
  const title = isReward
    ? 'Chỗ này sẽ hiện ảnh đáp án'
    : 'Chỗ này sẽ hiện ảnh gợi ý'
  const accent = isReward ? '#ffc96b' : '#7af5ef'

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-labelledby="title description">
  <title id="title">${title}</title>
  <desc id="description">Ảnh minh họa dành riêng cho chế độ hướng dẫn.</desc>
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="70%">
      <stop offset="0" stop-color="#234b66"/>
      <stop offset="0.55" stop-color="#111b42"/>
      <stop offset="1" stop-color="#070b22"/>
    </radialGradient>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1200" height="800" fill="url(#glow)"/>
  <circle cx="150" cy="135" r="4" fill="#7af5ef" opacity=".75"/>
  <circle cx="1045" cy="160" r="6" fill="#ffc96b" opacity=".72"/>
  <circle cx="980" cy="675" r="4" fill="#7af5ef" opacity=".6"/>
  <rect x="72" y="72" width="1056" height="656" rx="36" fill="none" stroke="${accent}" stroke-width="3" stroke-dasharray="14 18" opacity=".62"/>
  <g text-anchor="middle" font-family="Arial, Helvetica, sans-serif">
    <text x="600" y="315" fill="${accent}" font-size="26" font-weight="700" letter-spacing="7">CHẾ ĐỘ HƯỚNG DẪN</text>
    <text x="600" y="405" fill="#effffd" font-size="48" font-weight="700">${title}</text>
    <text x="600" y="474" fill="#b8d8dc" font-size="25">Ảnh thật của trò chơi được giữ kín</text>
    <circle cx="600" cy="565" r="8" fill="${accent}" filter="url(#softGlow)"/>
  </g>
</svg>`
}
