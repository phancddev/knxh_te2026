import type { Question } from '../types'
import Modal from './Modal'

interface FeedbackOverlayProps {
  question: Question
  onContinue: () => void
  continueLabel: string
}

export default function FeedbackOverlay({
  question,
  onContinue,
  continueLabel,
}: FeedbackOverlayProps) {
  return (
    <Modal labelledBy="reward-title" className="reward-dialog" returnFocusSelector=".quiz-prompt">
      <div className="reward-aura" aria-hidden="true" />
      <div className="reward-visual">
        <img className="reward-img" src={question.reward} alt="" width="200" height="200" />
      </div>
      <p className="dialog-kicker">Ấn ký đã thức tỉnh</p>
      <h2 id="reward-title">Chính xác!</h2>
      {question.rewardCaption && <p className="reward-caption">{question.rewardCaption}</p>}
      <div className="dialog-actions">
        <button type="button" className="btn-primary" onClick={onContinue}>
          {continueLabel}
        </button>
      </div>
    </Modal>
  )
}
