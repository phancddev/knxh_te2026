import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import jwt from 'jsonwebtoken'
import { createAnswerChecker, normalizeVietnamese } from './answer.js'
import { createDatabase } from './database.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT || 3000)
const databasePath = process.env.DATABASE_PATH || path.resolve(dirname, '../data/quiz.sqlite')
const hintImagePath = process.env.HINT_IMAGE_PATH || path.resolve(dirname, '../assets/goiygoc.jpeg')
const rewardImagePath = process.env.REWARD_IMAGE_PATH || path.resolve(dirname, '../assets/goiy.jpeg')
const jwtSecret = process.env.JWT_SECRET
const quizAnswer = process.env.QUIZ_ANSWER

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must contain at least 32 characters')
}

const checkAnswer = createAnswerChecker(quizAnswer)
const db = createDatabase(databasePath)
const app = express()

app.set('trust proxy', 1)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-origin' } }))
app.use(express.json({ limit: '32kb' }))

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.' },
})

function cleanText(value, maxLength = 80) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength)
}

function usernameKey(value) {
  return normalizeVietnamese(value).replace(/\s/g, '')
}

function validateCredentials(username, password) {
  if (username.length < 3) return 'Tên đăng nhập cần ít nhất 3 ký tự.'
  if (password.length < 6) return 'Mật khẩu cần ít nhất 6 ký tự.'
  return null
}

function createRoomCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = crypto.randomBytes(5).toString('base64url').toUpperCase()
    const exists = db.prepare('SELECT 1 FROM rooms WHERE code = ?').get(code)
    if (!exists) return code
  }
  throw new Error('Could not generate a unique room code')
}

function signSession(payload) {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: '30d',
    issuer: 'knxh-quiz',
    audience: 'knxh-web',
  })
}

function requireAuth(role) {
  return (request, response, next) => {
    const bearer = request.get('authorization') || ''
    const token = bearer.startsWith('Bearer ') ? bearer.slice(7) : ''

    try {
      const session = jwt.verify(token, jwtSecret, {
        issuer: 'knxh-quiz',
        audience: 'knxh-web',
      })
      if (role && session.role !== role) {
        return response.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này.' })
      }
      request.session = session
      next()
    } catch {
      response.status(401).json({ error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' })
    }
  }
}

function serializeRoom(room) {
  return { code: room.code, name: room.name, createdAt: room.created_at }
}

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.post('/api/rooms', authLimiter, async (request, response, next) => {
  try {
    const name = cleanText(request.body.name, 60) || 'Phòng Rừng Tri Thức'
    const username = cleanText(request.body.username, 40)
    const password = String(request.body.password ?? '')
    const credentialError = validateCredentials(username, password)
    if (credentialError) return response.status(400).json({ error: credentialError })

    const room = {
      id: crypto.randomUUID(),
      code: createRoomCode(),
      name,
      username,
      usernameKey: usernameKey(username),
      passwordHash: await bcrypt.hash(password, 12),
      createdAt: new Date().toISOString(),
    }

    db.prepare(`
      INSERT INTO rooms (
        id, code, name, owner_username, owner_username_key, owner_password_hash, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      room.id,
      room.code,
      room.name,
      room.username,
      room.usernameKey,
      room.passwordHash,
      room.createdAt,
    )

    response.status(201).json({
      token: signSession({ role: 'owner', roomId: room.id, username: room.username }),
      room: { code: room.code, name: room.name, createdAt: room.createdAt },
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/rooms/login', authLimiter, async (request, response, next) => {
  try {
    const code = cleanText(request.body.roomCode, 20).toUpperCase()
    const username = cleanText(request.body.username, 40)
    const password = String(request.body.password ?? '')
    const room = db.prepare(
      'SELECT * FROM rooms WHERE code = ? AND owner_username_key = ?',
    ).get(code, usernameKey(username))

    if (!room || !(await bcrypt.compare(password, room.owner_password_hash))) {
      return response.status(401).json({ error: 'Mã phòng, tên đăng nhập hoặc mật khẩu không đúng.' })
    }

    response.json({
      token: signSession({ role: 'owner', roomId: room.id, username: room.owner_username }),
      room: serializeRoom(room),
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/rooms/:code', (request, response) => {
  const room = db.prepare(
    'SELECT code, name, created_at FROM rooms WHERE code = ?',
  ).get(cleanText(request.params.code, 20).toUpperCase())

  if (!room) return response.status(404).json({ error: 'Không tìm thấy phòng này.' })
  response.json({ room: serializeRoom(room) })
})

app.post('/api/rooms/:code/teams', authLimiter, async (request, response, next) => {
  try {
    const code = cleanText(request.params.code, 20).toUpperCase()
    const room = db.prepare('SELECT * FROM rooms WHERE code = ?').get(code)
    if (!room) return response.status(404).json({ error: 'Không tìm thấy phòng này.' })

    const name = cleanText(request.body.name, 60)
    const username = cleanText(request.body.username, 40)
    const password = String(request.body.password ?? '')
    if (name.length < 2) return response.status(400).json({ error: 'Tên đội cần ít nhất 2 ký tự.' })
    const credentialError = validateCredentials(username, password)
    if (credentialError) return response.status(400).json({ error: credentialError })

    const team = {
      id: crypto.randomUUID(),
      name,
      username,
      usernameKey: usernameKey(username),
      passwordHash: await bcrypt.hash(password, 12),
      createdAt: new Date().toISOString(),
    }

    try {
      db.prepare(`
        INSERT INTO teams (
          id, room_id, name, username, username_key, password_hash, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        team.id,
        room.id,
        team.name,
        team.username,
        team.usernameKey,
        team.passwordHash,
        team.createdAt,
      )
    } catch (error) {
      if (String(error.message).includes('UNIQUE constraint failed')) {
        return response.status(409).json({ error: 'Tên đội hoặc tên đăng nhập đã được dùng trong phòng.' })
      }
      throw error
    }

    response.status(201).json({
      token: signSession({
        role: 'team',
        roomId: room.id,
        teamId: team.id,
        username: team.username,
      }),
      room: serializeRoom(room),
      team: { name: team.name, username: team.username },
      state: { hintRevealed: false, solved: false },
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/rooms/:code/teams/login', authLimiter, async (request, response, next) => {
  try {
    const code = cleanText(request.params.code, 20).toUpperCase()
    const username = cleanText(request.body.username, 40)
    const password = String(request.body.password ?? '')
    const team = db.prepare(`
      SELECT teams.*, rooms.code, rooms.name AS room_name, rooms.created_at AS room_created_at
      FROM teams JOIN rooms ON rooms.id = teams.room_id
      WHERE rooms.code = ? AND teams.username_key = ?
    `).get(code, usernameKey(username))

    if (!team || !(await bcrypt.compare(password, team.password_hash))) {
      return response.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu của đội không đúng.' })
    }

    response.json({
      token: signSession({
        role: 'team',
        roomId: team.room_id,
        teamId: team.id,
        username: team.username,
      }),
      room: { code: team.code, name: team.room_name, createdAt: team.room_created_at },
      team: { name: team.name, username: team.username },
      state: { hintRevealed: Boolean(team.hint_revealed_at), solved: Boolean(team.solved_at) },
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/session', requireAuth(), (request, response) => {
  if (request.session.role === 'owner') {
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(request.session.roomId)
    if (!room) return response.status(401).json({ error: 'Phòng không còn tồn tại.' })
    return response.json({ role: 'owner', room: serializeRoom(room) })
  }

  const team = db.prepare(`
    SELECT teams.*, rooms.code, rooms.name AS room_name, rooms.created_at AS room_created_at
    FROM teams JOIN rooms ON rooms.id = teams.room_id
    WHERE teams.id = ? AND rooms.id = ?
  `).get(request.session.teamId, request.session.roomId)

  if (!team) return response.status(401).json({ error: 'Đội không còn tồn tại.' })
  response.json({
    role: 'team',
    room: { code: team.code, name: team.room_name, createdAt: team.room_created_at },
    team: { name: team.name, username: team.username },
    state: { hintRevealed: Boolean(team.hint_revealed_at), solved: Boolean(team.solved_at) },
  })
})

app.get('/api/owner/dashboard', requireAuth('owner'), (request, response) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(request.session.roomId)
  if (!room) return response.status(404).json({ error: 'Không tìm thấy phòng.' })

  const teams = db.prepare(`
    SELECT id, name, username, created_at, hint_revealed_at, solved_at
    FROM teams WHERE room_id = ? ORDER BY created_at ASC
  `).all(room.id).map((team) => ({
    id: team.id,
    name: team.name,
    username: team.username,
    createdAt: team.created_at,
    hintRevealedAt: team.hint_revealed_at,
    solvedAt: team.solved_at,
  }))

  const hintLogs = db.prepare(`
    SELECT hint_logs.id, hint_logs.occurred_at, teams.name AS team_name, teams.username
    FROM hint_logs JOIN teams ON teams.id = hint_logs.team_id
    WHERE hint_logs.room_id = ? ORDER BY hint_logs.occurred_at DESC
  `).all(room.id).map((log) => ({
    id: log.id,
    teamName: log.team_name,
    username: log.username,
    occurredAt: log.occurred_at,
  }))

  response.json({ room: serializeRoom(room), teams, hintLogs })
})

app.post('/api/team/hint', requireAuth('team'), (request, response) => {
  const team = db.prepare(
    'SELECT hint_revealed_at FROM teams WHERE id = ? AND room_id = ?',
  ).get(request.session.teamId, request.session.roomId)
  if (!team) return response.status(404).json({ error: 'Không tìm thấy đội.' })

  if (!team.hint_revealed_at) {
    const occurredAt = new Date().toISOString()
    try {
      db.exec('BEGIN IMMEDIATE')
      db.prepare('UPDATE teams SET hint_revealed_at = ? WHERE id = ?').run(occurredAt, request.session.teamId)
      db.prepare(
        'INSERT INTO hint_logs (room_id, team_id, occurred_at) VALUES (?, ?, ?)',
      ).run(request.session.roomId, request.session.teamId, occurredAt)
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }

  response.json({ hintRevealed: true, imageUrl: '/api/team/hint-image' })
})

app.post('/api/team/answer', requireAuth('team'), (request, response) => {
  const answer = String(request.body.answer ?? '').slice(0, 160)
  if (!answer) return response.status(400).json({ error: 'Vui lòng nhập đáp án.' })

  const correct = checkAnswer(answer)
  if (!correct) return response.json({ correct: false })

  db.prepare(`
    UPDATE teams SET solved_at = COALESCE(solved_at, ?) WHERE id = ? AND room_id = ?
  `).run(new Date().toISOString(), request.session.teamId, request.session.roomId)

  response.json({ correct: true, imageUrl: '/api/team/reward-image' })
})

async function sendProtectedImage(request, response, mode) {
  const team = db.prepare(
    'SELECT hint_revealed_at, solved_at FROM teams WHERE id = ? AND room_id = ?',
  ).get(request.session.teamId, request.session.roomId)
  const allowed = mode === 'full' ? team?.solved_at : (team?.hint_revealed_at || team?.solved_at)
  if (!allowed) return response.status(403).json({ error: 'Ảnh này chưa được mở khóa.' })

  response.set({
    'Cache-Control': 'private, no-store',
    'Content-Type': 'image/jpeg',
  })

  const selectedImagePath = mode === 'full' ? rewardImagePath : hintImagePath
  return response.sendFile(path.resolve(selectedImagePath))
}

app.get('/api/team/hint-image', requireAuth('team'), (request, response, next) => {
  sendProtectedImage(request, response, 'hint').catch(next)
})

app.get('/api/team/reward-image', requireAuth('team'), (request, response, next) => {
  sendProtectedImage(request, response, 'full').catch(next)
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: 'Máy chủ gặp sự cố. Vui lòng thử lại.' })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`KNXH API listening on port ${port}`)
})
