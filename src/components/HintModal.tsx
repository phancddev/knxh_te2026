import Modal from './Modal'

interface HintModalProps {
  imageUrl: string
  onDismiss: () => void
}

export default function HintModal({ imageUrl, onDismiss }: HintModalProps) {
  return (
    <Modal labelledBy="hint-title" className="hint-dialog" onDismiss={onDismiss}>
      <p className="dialog-kicker">Một mảnh ký ức</p>
      <h2 id="hint-title">Góc dưới bên phải</h2>
      <p className="dialog-copy">Đây là phần duy nhất khu rừng cho phép hé lộ.</p>
      <div className="hint-image-frame">
        <img src={imageUrl} alt="Mảnh gợi ý được cắt từ góc dưới bên phải của hình bí mật" />
      </div>
      <div className="dialog-actions">
        <button type="button" className="btn-primary" onClick={onDismiss}>Tiếp tục giải</button>
      </div>
    </Modal>
  )
}
