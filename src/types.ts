export interface Question {
  id: string
  prompt: string
  clueLines: string[]
}

export type AnswerStatus = 'idle' | 'incorrect'
