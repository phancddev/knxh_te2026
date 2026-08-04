export interface Room {
  code: string
  name: string
  createdAt: string
  isTesting: boolean
}

export interface Team {
  name: string
  username: string
}

export interface TeamState {
  hintRevealed: boolean
  solved: boolean
}

export type Session =
  | { role: 'owner'; room: Room }
  | { role: 'team'; room: Room; team: Team; state: TeamState }

export interface OwnerDashboardData {
  room: Room
  teams: Array<{
    id: string
    name: string
    username: string
    createdAt: string
    hintRevealedAt: string | null
    solvedAt: string | null
  }>
  hintLogs: Array<{
    id: number
    teamName: string
    username: string
    occurredAt: string
  }>
}

const TOKEN_KEY = 'knxh.session'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body) headers.set('Content-Type', 'application/json')
  if (authenticated) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(path, { ...options, headers })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || 'Không thể kết nối máy chủ.')
  }
  return payload as T
}

export const api = {
  getRoom(code: string) {
    return request<{ room: Room }>(`/api/rooms/${encodeURIComponent(code)}`)
  },

  createRoom(data: { name: string; username: string; password: string; isTesting: boolean }) {
    return request<{ token: string; room: Room }>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  loginOwner(data: { roomCode: string; username: string; password: string }) {
    return request<{ token: string; room: Room }>('/api/rooms/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  createTeam(code: string, data: { name: string; username: string; password: string }) {
    return request<{ token: string; room: Room; team: Team; state: TeamState }>(
      `/api/rooms/${encodeURIComponent(code)}/teams`,
      { method: 'POST', body: JSON.stringify(data) },
    )
  },

  loginTeam(code: string, data: { username: string; password: string }) {
    return request<{ token: string; room: Room; team: Team; state: TeamState }>(
      `/api/rooms/${encodeURIComponent(code)}/teams/login`,
      { method: 'POST', body: JSON.stringify(data) },
    )
  },

  getSession() {
    return request<Session>('/api/session', {}, true)
  },

  getOwnerDashboard() {
    return request<OwnerDashboardData>('/api/owner/dashboard', {}, true)
  },

  revealHint() {
    return request<{ hintRevealed: true; imageUrl: string }>(
      '/api/team/hint',
      { method: 'POST' },
      true,
    )
  },

  checkAnswer(answer: string) {
    return request<{ correct: boolean; imageUrl?: string }>(
      '/api/team/answer',
      { method: 'POST', body: JSON.stringify({ answer }) },
      true,
    )
  },

  async protectedImage(path: string) {
    const token = getToken()
    const response = await fetch(path, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(payload.error || 'Không thể tải ảnh.')
    }
    return URL.createObjectURL(await response.blob())
  },
}
