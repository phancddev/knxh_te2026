import { useEffect, useState } from 'react'
import { api, clearToken, getToken, type Session } from './api'
import Background from './components/Background'
import AuthPortal from './components/AuthPortal'
import OwnerDashboard from './components/OwnerDashboard'
import TeamGame from './components/TeamGame'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [booting, setBooting] = useState(Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return
    api.getSession()
      .then(setSession)
      .catch(() => clearToken())
      .finally(() => setBooting(false))
  }, [])

  function logout() {
    clearToken()
    setSession(null)
  }

  return (
    <div className="app-shell">
      <Background />
      <a className="skip-link" href="#quiz-content">Đi đến câu hỏi</a>

      <main className={`stage ${session?.role === 'owner' ? 'stage--dashboard' : ''}`} id="quiz-content">
        {session?.role !== 'owner' && (
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

          <div className="progress" aria-label={session?.role === 'team' ? 'Câu 1 trên 1' : 'Cổng vào'}>
            <div className="progress-copy">
              <span>{session?.role === 'team' ? 'Mật thư' : 'Kết nối'}</span>
              <strong>{session?.role === 'team' ? '01 / 01' : 'ONLINE'}</strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: '100%' }} />
            </div>
          </div>
          </header>
        )}

        {booting ? (
          <div className="loading-card" role="status">
            <span className="loading-orb" aria-hidden="true" />
            <p>Đang nối lại hành trình...</p>
          </div>
        ) : !session ? (
          <AuthPortal onAuthenticated={setSession} />
        ) : session.role === 'owner' ? (
          <OwnerDashboard room={session.room} onLogout={logout} />
        ) : (
          <TeamGame
            room={session.room}
            team={session.team}
            initialState={session.state}
            onLogout={logout}
          />
        )}
      </main>
    </div>
  )
}
