import Modal from './Modal'

interface FeedbackOverlayProps {
  imageUrl: string
  onContinue: () => void
  continueLabel: string
}

export default function FeedbackOverlay({
  imageUrl,
  onContinue,
  continueLabel,
}: FeedbackOverlayProps) {
  return (
    <Modal labelledBy="reward-title" className="reward-dialog" returnFocusSelector=".quiz-prompt">
      <div className="reward-aura" aria-hidden="true" />
      <div className="reward-visual">
        <img className="reward-img" src={imageUrl} alt="Toàn bộ hình ảnh bí mật đã được mở khóa" />
      </div>
      <p className="dialog-kicker">Ấn ký đã thức tỉnh</p>
      <h2 id="reward-title">Chính xác!</h2>
      <p className="reward-caption">Đội của bạn đã mở khóa toàn bộ hình ảnh.</p>
      <div className="dialog-actions">
        <button type="button" className="btn-primary" onClick={onContinue}>
          {continueLabel}
        </button>
      </div>
    </Modal>
  )
}
