import { useEffect, useRef, type FormEvent } from 'react'
import type { AnswerStatus, Question } from '../types'

interface QuizCardProps {
  question: Question
  answer: string
  status: AnswerStatus
  submitting: boolean
  hintRevealed: boolean
  onAnswerChange: (answer: string) => void
  onSubmit: () => void
  onRequestHint: () => void
}

export default function QuizCard({
  question,
  answer,
  status,
  submitting,
  hintRevealed,
  onAnswerChange,
  onSubmit,
  onRequestHint,
}: QuizCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'incorrect') inputRef.current?.focus()
  }, [status])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <section className="quiz-card riddle-card" aria-labelledby={`question-${question.id}`}>
      <div className="panel-ornament panel-ornament--top" aria-hidden="true">
        <span />
        <svg viewBox="0 0 42 42">
          <path d="M21 3 26 16 39 21 26 26 21 39 16 26 3 21 16 16Z" />
          <circle cx="21" cy="21" r="5" />
        </svg>
        <span />
      </div>

      <p className="question-kicker">Mật thư của khu rừng</p>
      <h1 id={`question-${question.id}`} className="quiz-prompt riddle-prompt">
        {question.prompt}
      </h1>

      <blockquote className="riddle-verse">
        {question.clueLines.map((line) => <span key={line}>{line}</span>)}
      </blockquote>

      <form className="answer-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="location-answer">Địa điểm bạn tìm được</label>
        <div className={`answer-input-wrap ${status === 'incorrect' ? 'answer-input-wrap--error' : ''}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            ref={inputRef}
            id="location-answer"
            name="location-answer"
            type="text"
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onSubmit()
              }
            }}
            placeholder="Nhập tên địa điểm..."
            autoComplete="off"
            aria-describedby="answer-help answer-error"
            aria-invalid={status === 'incorrect'}
          />
          <button type="submit" className="answer-submit" disabled={!answer.trim() || submitting}>
            {submitting ? 'Đang kiểm tra...' : 'Mở khóa'}
          </button>
        </div>

        <p id="answer-help" className="answer-help">
          Có thể nhập có dấu hoặc không dấu, không phân biệt chữ hoa và chữ thường.
        </p>

        <p
          id="answer-error"
          className="answer-error"
          role={status === 'incorrect' ? 'alert' : undefined}
          aria-live="polite"
        >
          {status === 'incorrect'
            ? 'Chưa đúng rồi. Hãy đọc lại các từ khóa về vị trí và cách chơi nhé.'
            : ''}
        </p>
      </form>

      <div className="hint-action">
        <span aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c1 .7 1 1.3 1 2.3h6c0-1 .1-1.6 1-2.3A7 7 0 0 0 12 2Z" />
          </svg>
        </span>
        <div>
          <strong>{hintRevealed ? 'Gợi ý đã được mở khóa' : 'Bạn đang mắc kẹt?'}</strong>
          <small>{hintRevealed ? 'Có thể xem lại mà không ghi thêm nhật ký.' : 'Mở một phần nhỏ của hình bí mật.'}</small>
        </div>
        <button type="button" className="btn-secondary compact-btn" onClick={onRequestHint}>
          {hintRevealed ? 'Xem lại gợi ý' : 'Cần gợi ý'}
        </button>
      </div>
    </section>
  )
}
