import { useEffect, useState, type FormEvent } from 'react'
import { api, saveToken, type Room, type Session } from '../api'

interface AuthPortalProps {
  onAuthenticated: (session: Session) => void
}

type PublicMode = 'create-room' | 'owner-login' | 'join-team' | 'team-login'

const modes: Record<PublicMode, { eyebrow: string; title: string; submit: string }> = {
  'create-room': {
    eyebrow: 'Khởi tạo hành trình',
    title: 'Tạo phòng mới',
    submit: 'Tạo phòng',
  },
  'owner-login': {
    eyebrow: 'Trở lại khu rừng',
    title: 'Chủ phòng đăng nhập',
    submit: 'Vào phòng',
  },
  'join-team': {
    eyebrow: 'Lời mời đã mở',
    title: 'Đăng ký đội chơi',
    submit: 'Tham gia phòng',
  },
  'team-login': {
    eyebrow: 'Tiếp tục hành trình',
    title: 'Đội chơi đăng nhập',
    submit: 'Vào màn chơi',
  },
}

export default function AuthPortal({ onAuthenticated }: AuthPortalProps) {
  const inviteCode = new URLSearchParams(window.location.search).get('room')?.toUpperCase() || ''
  const [room, setRoom] = useState<Room | null>(null)
  const [mode, setMode] = useState<PublicMode>(inviteCode ? 'join-team' : 'create-room')
  const [roomName, setRoomName] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [roomCode, setRoomCode] = useState(inviteCode)
  const [teamName, setTeamName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!inviteCode) return
    api.getRoom(inviteCode)
      .then(({ room: foundRoom }) => setRoom(foundRoom))
      .catch((reason) => setError(reason.message))
  }, [inviteCode])

  function switchMode(nextMode: PublicMode) {
    setMode(nextMode)
    setError('')
    setUsername('')
    setPassword('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'create-room') {
        const result = await api.createRoom({ name: roomName, username, password, isTesting })
        saveToken(result.token)
        onAuthenticated({ role: 'owner', room: result.room })
      } else if (mode === 'owner-login') {
        const result = await api.loginOwner({ roomCode, username, password })
        saveToken(result.token)
        onAuthenticated({ role: 'owner', room: result.room })
      } else if (mode === 'join-team') {
        const result = await api.createTeam(inviteCode, { name: teamName, username, password })
        saveToken(result.token)
        onAuthenticated({
          role: 'team',
          room: result.room,
          team: result.team,
          state: result.state,
        })
      } else {
        const result = await api.loginTeam(inviteCode, { username, password })
        saveToken(result.token)
        onAuthenticated({
          role: 'team',
          room: result.room,
          team: result.team,
          state: result.state,
        })
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể hoàn tất thao tác.')
    } finally {
      setLoading(false)
    }
  }

  const copy = modes[mode]
  const isInvite = Boolean(inviteCode)

  return (
    <section className="portal-card" aria-labelledby="portal-title">
      <div className="panel-ornament panel-ornament--top" aria-hidden="true">
        <span />
        <svg viewBox="0 0 42 42">
          <path d="M21 3 26 16 39 21 26 26 21 39 16 26 3 21 16 16Z" />
          <circle cx="21" cy="21" r="5" />
        </svg>
        <span />
      </div>

      {isInvite && (
        <div className="invite-room">
          <span>Mã phòng</span>
          <strong>{inviteCode}</strong>
          <small>{room?.name || 'Đang tìm phòng...'}</small>
          {room?.isTesting && <em>Phòng hướng dẫn</em>}
        </div>
      )}

      <p className="question-kicker">{copy.eyebrow}</p>
      <h1 id="portal-title" className="portal-title">{copy.title}</h1>

      <div className="mode-switch" role="tablist" aria-label="Chọn hình thức đăng nhập">
        {isInvite ? (
          <>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'join-team'}
              onClick={() => switchMode('join-team')}
            >
              Đội mới
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'team-login'}
              onClick={() => switchMode('team-login')}
            >
              Đã có tài khoản
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'create-room'}
              onClick={() => switchMode('create-room')}
            >
              Tạo phòng
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'owner-login'}
              onClick={() => switchMode('owner-login')}
            >
              Vào lại phòng
            </button>
          </>
        )}
      </div>

      <form className="portal-form" onSubmit={handleSubmit}>
        {mode === 'create-room' && (
          <>
            <label>
              <span>Tên phòng</span>
              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="Ví dụ: Hành trình mùa hè"
                maxLength={60}
                autoFocus
              />
            </label>

            <label className={`testing-mode-option${isTesting ? ' testing-mode-option--active' : ''}`}>
              <input
                type="checkbox"
                checked={isTesting}
                onChange={(event) => setIsTesting(event.target.checked)}
              />
              <span className="testing-mode-control" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>
              </span>
              <span className="testing-mode-copy">
                <strong>Chế độ hướng dẫn / testing</strong>
                <small>Dùng ảnh minh họa và đáp án thử, không làm lộ nội dung trò chơi thật.</small>
              </span>
            </label>
          </>
        )}

        {mode === 'owner-login' && (
          <label>
            <span>Mã phòng</span>
            <input
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
              placeholder="Nhập mã phòng"
              maxLength={20}
              autoCapitalize="characters"
              autoFocus
              required
            />
          </label>
        )}

        {mode === 'join-team' && (
          <label>
            <span>Tên đội</span>
            <input
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="Ví dụ: Đom Đóm Xanh"
              maxLength={60}
              autoFocus
              required
            />
          </label>
        )}

        <label>
          <span>Tên đăng nhập</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={isInvite ? 'Tài khoản của đội' : 'Tài khoản chủ phòng'}
            minLength={3}
            maxLength={40}
            autoComplete="username"
            required
          />
        </label>

        <label>
          <span>Mật khẩu</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            minLength={6}
            autoComplete={mode === 'create-room' || mode === 'join-team' ? 'new-password' : 'current-password'}
            required
          />
        </label>

        <p className="form-note">
          Hãy lưu tên đăng nhập và mật khẩu để có thể quay lại đúng phiên này.
        </p>
        <p className="form-error" role="alert" aria-live="polite">{error}</p>

        <button className="btn-primary portal-submit" type="submit" disabled={loading || (isInvite && !room)}>
          {loading ? 'Đang mở cổng...' : copy.submit}
        </button>
      </form>

      {isInvite && (
        <a className="text-link" href={window.location.pathname}>Về trang chủ phòng</a>
      )}
    </section>
  )
}
