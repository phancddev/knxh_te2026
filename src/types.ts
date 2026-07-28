export interface Question {
  id: string
  prompt: string
  clueLines: string[]
  correctAnswer: string
  reward: string
  rewardCaption: string
}

export type AnswerStatus = 'idle' | 'incorrect'
