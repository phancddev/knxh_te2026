import Modal from './Modal'

interface ConfirmHintModalProps {
  loading: boolean
  onConfirm: () => void
  onDismiss: () => void
}

export default function ConfirmHintModal({ loading, onConfirm, onDismiss }: ConfirmHintModalProps) {
  return (
    <Modal labelledBy="confirm-hint-title" onDismiss={loading ? undefined : onDismiss}>
      <div className="modal-emblem" aria-hidden="true">
        <svg viewBox="0 0 54 54">
          <path d="M27 5c-10 0-18 7-18 17 0 7 4 11 9 15v7h18v-7c5-4 9-8 9-15C45 12 37 5 27 5Z" />
          <path d="M20 49h14M27 12v5M17 18l4 3M37 21l4-3" />
        </svg>
      </div>
      <p className="dialog-kicker">Lời thì thầm của rừng</p>
      <h2 id="confirm-hint-title">Xác nhận xem gợi ý?</h2>
      <p className="dialog-copy">
        Chủ phòng sẽ biết tên đội và thời điểm bạn mở gợi ý theo giờ UTC+7.
      </p>
      <p className="hint-cost-note">
        Mua gợi ý = 2 con dấu
      </p>
      <div className="dialog-actions">
        <button type="button" className="btn-secondary" onClick={onDismiss} disabled={loading}>
          Chưa cần
        </button>
        <button type="button" className="btn-primary" onClick={onConfirm} disabled={loading}>
          {loading ? 'Đang mở...' : 'Có, mở gợi ý'}
        </button>
      </div>
    </Modal>
  )
}
