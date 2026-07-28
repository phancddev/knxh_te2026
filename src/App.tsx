import { useState } from 'react'
import { QUESTIONS } from './data/questions'
import type { AnswerStatus } from './types'
import { isCorrectLocationAnswer } from './utils/answerMatching'
import Background from './components/Background'
import QuizCard from './components/QuizCard'
import FeedbackOverlay from './components/FeedbackOverlay'

export default function App() {
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState<AnswerStatus>('idle')
  const [isCorrect, setIsCorrect] = useState(false)
  const question = QUESTIONS[0]

  function handleAnswerChange(value: string) {
    setAnswer(value)
    if (status === 'incorrect') setStatus('idle')
  }

  function handleSubmit() {
    if (isCorrectLocationAnswer(answer)) {
      setStatus('idle')
      setIsCorrect(true)
      return
    }

    setStatus('incorrect')
  }

  function handleRestart() {
    setAnswer('')
    setStatus('idle')
    setIsCorrect(false)
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>('#location-answer')?.focus())
  }

  return (
    <div className="app-shell">
      <Background />
      <a className="skip-link" href="#quiz-content">Đi đến câu hỏi</a>

      <main className="stage" id="quiz-content">
        <header className="game-hud">
          <div className="brand-mark" aria-label="Rừng Tri Thức">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M24 3 29 18 45 24 29 30 24 45 19 30 3 24 19 18Z" />
              <circle cx="24" cy="24" r="6" />
            </svg>
            <span>
              <strong>Rừng Tri Thức</strong>
              <small>Hành trình đêm trăng</small>
            </span>
          </div>

          <div className="progress" aria-label="Câu 1 trên 1">
            <div className="progress-copy">
              <span>Mật thư</span>
              <strong>01 / 01</strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: '100%' }} />
            </div>
          </div>
        </header>

        <div className="quiz-transition">
          <QuizCard
            question={question}
            answer={answer}
            status={status}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmit}
          />
        </div>

        {isCorrect && (
          <FeedbackOverlay
            question={question}
            onContinue={handleRestart}
            continueLabel="Chơi lại"
          />
        )}
      </main>
    </div>
  )
}
