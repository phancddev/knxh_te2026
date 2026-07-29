import { useCallback, useEffect, useState } from 'react'
import { api, type OwnerDashboardData, type Room } from '../api'

interface OwnerDashboardProps {
  room: Room
  onLogout: () => void
}

function formatUtc7(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    dateStyle: 'medium',
    timeStyle: 'medium',
    hour12: false,
  }).format(new Date(value))
}

export default function OwnerDashboard({ room, onLogout }: OwnerDashboardProps) {
  const [data, setData] = useState<OwnerDashboardData | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${room.code}`

  const loadDashboard = useCallback(async () => {
    try {
      setData(await api.getOwnerDashboard())
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể tải dữ liệu phòng.')
    }
  }, [])

  useEffect(() => {
    loadDashboard()
    const timer = window.setInterval(loadDashboard, 5000)
    return () => window.clearInterval(timer)
  }, [loadDashboard])

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2500)
  }

  return (
    <section className="dashboard" aria-labelledby="dashboard-title">
      <header className="dashboard-header">
        <div>
          <p className="question-kicker">Bảng điều khiển chủ phòng</p>
          <h1 id="dashboard-title">{room.name}</h1>
          <p>Mã phòng <strong>{room.code}</strong></p>
        </div>
        <button type="button" className="btn-secondary compact-btn" onClick={onLogout}>
          Đăng xuất
        </button>
      </header>

      <div className="invite-panel">
        <div>
          <span>Link mời các đội</span>
          <strong>{inviteUrl}</strong>
        </div>
        <button type="button" className="btn-primary compact-btn" onClick={copyInvite}>
          {copied ? 'Đã sao chép' : 'Sao chép link'}
        </button>
      </div>

      {error && <p className="form-error dashboard-error" role="alert">{error}</p>}

      <div className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="section-heading">
            <div>
              <span>Đội tham gia</span>
              <h2>{data?.teams.length ?? 0} đội</h2>
            </div>
            <button type="button" className="icon-button" onClick={loadDashboard} aria-label="Làm mới dữ liệu">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />
              </svg>
            </button>
          </div>

          {!data?.teams.length ? (
            <p className="empty-state">Chưa có đội nào. Hãy gửi link mời để bắt đầu.</p>
          ) : (
            <div className="team-list">
              {data.teams.map((team) => (
                <div className="team-row" key={team.id}>
                  <div className="team-avatar" aria-hidden="true">{team.name.slice(0, 1).toUpperCase()}</div>
                  <div>
                    <strong>{team.name}</strong>
                    <span>@{team.username}</span>
                  </div>
                  <div className="team-status">
                    {team.solvedAt ? (
                      <span className="status-pill status-pill--solved">Đã giải đúng</span>
                    ) : team.hintRevealedAt ? (
                      <span className="status-pill status-pill--hint">Đã xem gợi ý</span>
                    ) : (
                      <span className="status-pill">Đang chơi</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="dashboard-panel">
          <div className="section-heading">
            <div>
              <span>Nhật ký gợi ý</span>
              <h2>Theo giờ UTC+7</h2>
            </div>
          </div>

          {!data?.hintLogs.length ? (
            <p className="empty-state">Chưa có đội nào yêu cầu mở gợi ý.</p>
          ) : (
            <ol className="log-list">
              {data.hintLogs.map((log) => (
                <li key={log.id}>
                  <span className="log-dot" aria-hidden="true" />
                  <div>
                    <strong>{log.teamName}</strong>
                    <span>@{log.username} đã mở gợi ý</span>
                    <time dateTime={log.occurredAt}>{formatUtc7(log.occurredAt)}</time>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </article>
      </div>
    </section>
  )
}
