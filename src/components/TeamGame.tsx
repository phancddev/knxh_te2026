import { useEffect, useState } from 'react'
import { api, type Room, type Team, type TeamState } from '../api'
import { QUESTIONS } from '../data/questions'
import type { AnswerStatus } from '../types'
import ConfirmHintModal from './ConfirmHintModal'
import FeedbackOverlay from './FeedbackOverlay'
import HintModal from './HintModal'
import QuizCard from './QuizCard'

interface TeamGameProps {
  room: Room
  team: Team
  initialState: TeamState
  onLogout: () => void
}

export default function TeamGame({ room, team, initialState, onLogout }: TeamGameProps) {
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState<AnswerStatus>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [hintRevealed, setHintRevealed] = useState(initialState.hintRevealed)
  const [showHintConfirm, setShowHintConfirm] = useState(false)
  const [hintLoading, setHintLoading] = useState(false)
  const [hintImage, setHintImage] = useState('')
  const [rewardImage, setRewardImage] = useState('')
  const [solved, setSolved] = useState(initialState.solved)
  const [showReward, setShowReward] = useState(initialState.solved)
  const [notice, setNotice] = useState('')
  const question = QUESTIONS[0]

  useEffect(() => () => {
    if (hintImage) URL.revokeObjectURL(hintImage)
    if (rewardImage) URL.revokeObjectURL(rewardImage)
  }, [hintImage, rewardImage])

  useEffect(() => {
    if (!initialState.solved) return
    api.protectedImage('/api/team/reward-image')
      .then(setRewardImage)
      .catch((reason) => setNotice(reason.message))
  }, [initialState.solved])

  function handleAnswerChange(value: string) {
    setAnswer(value)
    if (status === 'incorrect') setStatus('idle')
    setNotice('')
  }

  async function handleSubmit() {
    setSubmitting(true)
    setNotice('')
    try {
      const result = await api.checkAnswer(answer)
      if (!result.correct || !result.imageUrl) {
        setStatus('incorrect')
        return
      }
      setStatus('idle')
      const imageUrl = await api.protectedImage(result.imageUrl)
      setRewardImage(imageUrl)
      setSolved(true)
      setShowReward(true)
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : 'Không thể kiểm tra đáp án.')
    } finally {
      setSubmitting(false)
    }
  }

  async function loadHint(logRequest: boolean) {
    setHintLoading(true)
    setNotice('')
    try {
      const imagePath = logRequest
        ? (await api.revealHint()).imageUrl
        : '/api/team/hint-image'
      const imageUrl = await api.protectedImage(imagePath)
      setHintRevealed(true)
      setShowHintConfirm(false)
      setHintImage(imageUrl)
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : 'Không thể mở gợi ý.')
    } finally {
      setHintLoading(false)
    }
  }

  function requestHint() {
    if (hintRevealed) {
      loadHint(false)
    } else {
      setShowHintConfirm(true)
    }
  }

  return (
    <>
      <div className="team-context">
        <div>
          <span>{room.name}</span>
          <strong>{team.name}</strong>
        </div>
        <button type="button" className="text-button" onClick={onLogout}>Đăng xuất</button>
      </div>

      {room.isTesting && (
        <div className="testing-room-banner" role="status">
          <strong>Phòng hướng dẫn</strong>
          <span>Ảnh thật đang được ẩn. Dùng đáp án thử: <code>test</code></span>
        </div>
      )}

      {notice && <p className="floating-notice" role="alert">{notice}</p>}

      <div className="quiz-transition">
        <QuizCard
          question={question}
          answer={answer}
          status={status}
          submitting={submitting}
          hintRevealed={hintRevealed}
          onAnswerChange={handleAnswerChange}
          onSubmit={handleSubmit}
          onRequestHint={requestHint}
        />
      </div>

      {solved && !showReward && rewardImage && (
        <button type="button" className="btn-primary" onClick={() => setShowReward(true)}>
          Xem lại hình đã mở khóa
        </button>
      )}

      {showHintConfirm && (
        <ConfirmHintModal
          loading={hintLoading}
          onConfirm={() => loadHint(true)}
          onDismiss={() => setShowHintConfirm(false)}
        />
      )}
      {hintImage && (
        <HintModal
          imageUrl={hintImage}
          testing={room.isTesting}
          onDismiss={() => {
            URL.revokeObjectURL(hintImage)
            setHintImage('')
          }}
        />
      )}
      {showReward && rewardImage && (
        <FeedbackOverlay
          imageUrl={rewardImage}
          testing={room.isTesting}
          onContinue={() => setShowReward(false)}
          continueLabel="Trở lại màn chơi"
        />
      )}
    </>
  )
}
