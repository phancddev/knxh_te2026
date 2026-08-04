import Modal from './Modal'

interface HintModalProps {
  imageUrl: string
  testing?: boolean
  onDismiss: () => void
}

export default function HintModal({ imageUrl, testing = false, onDismiss }: HintModalProps) {
  return (
    <Modal labelledBy="hint-title" className="hint-dialog" onDismiss={onDismiss}>
      <p className="dialog-kicker">{testing ? 'Chế độ hướng dẫn' : 'Một mảnh ký ức'}</p>
      <h2 id="hint-title">{testing ? 'Ảnh gợi ý mẫu' : 'Góc dưới bên phải'}</h2>
      <p className="dialog-copy">
        {testing
          ? 'Trong phòng thật, vị trí này sẽ hiển thị ảnh gợi ý.'
          : 'Đây là phần duy nhất khu rừng cho phép hé lộ.'}
      </p>
      <div className="hint-image-frame">
        <img
          src={imageUrl}
          alt={testing ? 'Ảnh minh họa vị trí hiển thị gợi ý' : 'Mảnh gợi ý được cắt từ góc dưới bên phải của hình bí mật'}
        />
      </div>
      <div className="dialog-actions">
        <button type="button" className="btn-primary" onClick={onDismiss}>Tiếp tục giải</button>
      </div>
    </Modal>
  )
}
