import Modal from './Modal'

interface FeedbackOverlayProps {
  imageUrl: string
  testing?: boolean
  onContinue: () => void
  continueLabel: string
}

export default function FeedbackOverlay({
  imageUrl,
  testing = false,
  onContinue,
  continueLabel,
}: FeedbackOverlayProps) {
  return (
    <Modal labelledBy="reward-title" className="reward-dialog" returnFocusSelector=".quiz-prompt">
      <div className="reward-aura" aria-hidden="true" />
      <div className="reward-visual">
        <img
          className="reward-img"
          src={imageUrl}
          alt={testing ? 'Ảnh minh họa vị trí hiển thị đáp án' : 'Toàn bộ hình ảnh bí mật đã được mở khóa'}
        />
      </div>
      <p className="dialog-kicker">{testing ? 'Chế độ hướng dẫn' : 'Ấn ký đã thức tỉnh'}</p>
      <h2 id="reward-title">{testing ? 'Đã trả lời đúng!' : 'Chính xác!'}</h2>
      <p className="reward-caption">
        {testing
          ? 'Trong phòng thật, vị trí này sẽ hiển thị toàn bộ ảnh đáp án.'
          : 'Đội của bạn đã mở khóa toàn bộ hình ảnh.'}
      </p>
      <div className="dialog-actions">
        <button type="button" className="btn-primary" onClick={onContinue}>
          {continueLabel}
        </button>
      </div>
    </Modal>
  )
}
