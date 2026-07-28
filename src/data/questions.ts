import type { Question } from '../types'

const volleyballReward =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <defs>
        <radialGradient id="aura" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#fff6ba"/>
          <stop offset="48%" stop-color="#61ece7"/>
          <stop offset="100%" stop-color="#4160b0"/>
        </radialGradient>
        <linearGradient id="ball" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#effffd"/>
          <stop offset="100%" stop-color="#86ddd9"/>
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="5"/></filter>
      </defs>
      <circle cx="100" cy="100" r="78" fill="url(#aura)" opacity=".34" filter="url(#glow)"/>
      <circle cx="100" cy="100" r="58" fill="url(#ball)" stroke="#ffffff" stroke-width="3"/>
      <path d="M100 42c18 15 29 34 32 58M132 100c-20-5-41-3-61 8M71 108c2 18 10 34 25 49"
        fill="none" stroke="#426ca3" stroke-width="9" stroke-linecap="round"/>
      <path d="M100 42c-21 4-38 15-50 33M50 75c12 8 20 19 21 33M96 157c18-3 34-13 44-28"
        fill="none" stroke="#6952ae" stroke-width="8" stroke-linecap="round"/>
    </svg>`,
  )

export const QUESTIONS: Question[] = [
  {
    id: 'volleyball-court',
    prompt: 'Dựa vào gợi ý sau, tìm ra địa điểm được nhắc đến:',
    clueLines: [
      'Sáu đứa trên sân chạy lòng vòng,',
      'Ba dưới phòng thủ, ba trên công.',
      'Bước một, chuyền hai rồi đập bóng,',
      'Quyết giành phần thắng để lập công.',
    ],
    correctAnswer: 'Sân bóng chuyền',
    reward: volleyballReward,
    rewardCaption: 'Đáp án chính xác là: Sân bóng chuyền',
  },
]
