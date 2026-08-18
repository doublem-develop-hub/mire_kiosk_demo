import { useCallback, useEffect, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { KioskFrame } from '@/components/KioskFrame'
import { IdleScreen } from '@/screens/IdleScreen'
import { ConsentScreen } from '@/screens/ConsentScreen'
import { NameInputScreen } from '@/screens/NameInputScreen'
import type { KioskUser } from '@/screens/NameInputScreen'
import { StressScreen } from '@/screens/StressScreen'
import { MeasuringScreen } from '@/screens/MeasuringScreen'
import type { MeasuringStage, VitalsResult } from '@/screens/MeasuringScreen'
import { VitalsScanningOverlay } from '@/screens/VitalsScanningOverlay'
import type { VitalsScanPhase } from '@/screens/VitalsScanningOverlay'
import { AnalyzingScreen } from '@/screens/AnalyzingScreen'
import { DoneScreen } from '@/screens/DoneScreen'
import type { MeasureSummary } from '@/screens/DoneScreen'
import { ErrorScreen } from '@/screens/ErrorScreen'
import { ERRORS } from '@/kiosk/errors'
import type { ErrorDef } from '@/kiosk/errors'
import {
  fetchRoster,
  startVisit,
  retryVisit,
  cancelVisit,
  openVisitSocket,
} from '@/lib/api'
import type { StressLevel, VisitEvent } from '@/lib/api'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
  },
})

type Phase =
  | 'idle'
  | 'consent'
  | 'nameInput'
  | 'stress'
  | 'measuring'
  | 'analyzing'
  | 'done'
  | 'error'

/** AI 분석 연출 시간(ms) */
const ANALYZE_DELAY = 2800
/** 완료 화면 대기 시간(초) */
const DONE_SECONDS = 8
/** 박람회 시연 방문객은 사내 부서/출퇴근 구분이 없으므로 고정값을 보낸다 */
const EXPO_DEPT = '박람회 방문객'
const EXPO_CHECK_TYPE = '체험'

const GENERIC_ERROR: ErrorDef = {
  key: 'kiosk-error',
  severity: 'system',
  stage: '측정',
  icon: ERRORS['network-error'].icon,
  title: '문제가 발생했어요',
  message: '측정 중 오류가 발생했어요.\n다시 시도해 주세요.',
  primary: '다시 시도',
  secondary: '처음으로',
}

function Kiosk() {
  const roster = useQuery({ queryKey: ['roster'], queryFn: fetchRoster })

  const [phase, setPhase] = useState<Phase>('idle')
  const [doneLeft, setDoneLeft] = useState(DONE_SECONDS)
  const [summary, setSummary] = useState<MeasureSummary | null>(null)
  const [user, setUser] = useState<KioskUser | null>(null)
  const [visitId, setVisitId] = useState<string | null>(null)
  const [measuringStage, setMeasuringStage] = useState<MeasuringStage>('iris')
  const [countdownSec, setCountdownSec] = useState<number | null>(null)
  const [waitMessage, setWaitMessage] = useState<string | undefined>(undefined)
  const [vitalsResult, setVitalsResult] = useState<VitalsResult | null>(null)
  const [errorDef, setErrorDef] = useState<ErrorDef>(GENERIC_ERROR)

  const startedAtRef = useRef<Date | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const closeSocket = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  const reset = useCallback(() => {
    closeSocket()
    setUser(null)
    setVisitId(null)
    setCountdownSec(null)
    setWaitMessage(undefined)
    setVitalsResult(null)
    setPhase('idle')
  }, [closeSocket])

  const handleVisitEvent = useCallback((event: VisitEvent) => {
    switch (event.type) {
      case 'capture_started':
        setMeasuringStage('iris')
        break
      case 'sensor_wait':
        setMeasuringStage('vitals_wait')
        setWaitMessage(event.message)
        break
      case 'sensor_measuring':
        setMeasuringStage('vitals_measuring')
        setCountdownSec(null)
        break
      case 'sensor_countdown':
        setMeasuringStage('vitals_measuring')
        setCountdownSec(event.remainingSec)
        break
      case 'error':
        setErrorDef(ERRORS[event.code] ?? GENERIC_ERROR)
        setPhase('error')
        break
      case 'done': {
        const startedAt = startedAtRef.current ?? new Date()
        const vitals = event.vitals
        const hasVitals =
          vitals.temp_c != null || vitals.heart_rate_bpm != null || vitals.spo2_pct != null
        setSummary({
          measuredAt: startedAt,
          durationSec: Math.max(
            1,
            Math.round((Date.now() - startedAt.getTime()) / 1000)
          ),
          vitals,
        })
        if (hasVitals) {
          setVitalsResult(vitals)
          setMeasuringStage('vitals_result')
        } else {
          setPhase('analyzing')
        }
        break
      }
      // capture_error(비-종단)/sensor_timeout: 뒤이어 오는 error/done 이벤트가 화면을 결정하므로 무시
    }
  }, [])

  const connectSocket = useCallback(
    (id: string) => {
      closeSocket()
      wsRef.current = openVisitSocket(id, handleVisitEvent)
    },
    [closeSocket, handleVisitEvent]
  )

  const submitName = useCallback((entered: KioskUser) => {
    setUser(entered)
    setPhase('stress')
  }, [])

  const submitStress = useCallback(
    async (level: StressLevel) => {
      if (!user) return
      try {
        const { visitId: id } = await startVisit({
          name: user.name,
          dept: EXPO_DEPT,
          checkType: EXPO_CHECK_TYPE,
          stressLabel: level.label,
          stressScore: level.score,
        })
        setVisitId(id)
        startedAtRef.current = new Date()
        setMeasuringStage('iris')
        setCountdownSec(null)
        setVitalsResult(null)
        connectSocket(id)
        setPhase('measuring')
      } catch {
        setErrorDef(GENERIC_ERROR)
        setPhase('error')
      }
    },
    [user, connectSocket]
  )

  const retryFromError = useCallback(() => {
    if (!visitId) {
      reset()
      return
    }
    retryVisit(visitId).catch(() => {})
    connectSocket(visitId)
    setMeasuringStage('iris')
    setCountdownSec(null)
    setVitalsResult(null)
    setPhase('measuring')
  }, [visitId, connectSocket, reset])

  const cancelFromError = useCallback(() => {
    if (visitId) cancelVisit(visitId).catch(() => {})
    reset()
  }, [visitId, reset])

  // vitals_result 단계: 실제 값이 0에서 올라가는 걸 잠시 보여준 뒤 analyzing으로
  useEffect(() => {
    if (phase !== 'measuring' || measuringStage !== 'vitals_result') return
    const timer = setTimeout(() => setPhase('analyzing'), 1600)
    return () => clearTimeout(timer)
  }, [phase, measuringStage])

  // analyzing 단계: 측정 완료 → 짧은 연출 후 완료 화면
  useEffect(() => {
    if (phase !== 'analyzing') return
    const timer = setTimeout(() => setPhase('done'), ANALYZE_DELAY)
    return () => clearTimeout(timer)
  }, [phase])

  // done 단계: 카운트다운 후 자동으로 대기 화면 복귀
  useEffect(() => {
    if (phase !== 'done') return
    setDoneLeft(DONE_SECONDS)
    const interval = setInterval(() => {
      setDoneLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    const timer = setTimeout(reset, DONE_SECONDS * 1000)
    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [phase, reset])

  useEffect(() => closeSocket, [closeSocket])

  if (roster.isLoading) {
    return (
      <KioskFrame>
        <div className="flex h-full items-center justify-center text-3xl text-muted-foreground">
          키오스크 서버에 연결하는 중입니다…
        </div>
      </KioskFrame>
    )
  }

  if (roster.isError || !roster.data) {
    return (
      <KioskFrame>
        <ErrorScreen def={ERRORS['out-of-service']} onPrimary={() => roster.refetch()} />
      </KioskFrame>
    )
  }

  return (
    <KioskFrame>
      {phase === 'idle' && <IdleScreen onStart={() => setPhase('consent')} />}
      {phase === 'consent' && (
        <ConsentScreen onAgree={() => setPhase('nameInput')} onDecline={reset} />
      )}
      {phase === 'nameInput' && <NameInputScreen onSubmit={submitName} />}
      {phase === 'stress' && (
        <StressScreen levels={roster.data.stressLevels} onSubmit={submitStress} />
      )}
      {phase === 'measuring' && (
        <MeasuringScreen
          stage={measuringStage}
          countdownSec={countdownSec}
          waitMessage={waitMessage}
          vitalsResult={vitalsResult}
          username={user?.name ?? ''}
        />
      )}
      {phase === 'analyzing' && <AnalyzingScreen />}
      {phase === 'done' && summary && (
        <DoneScreen summary={summary} secondsLeft={doneLeft} onHome={reset} />
      )}
      {phase === 'error' && (
        <ErrorScreen def={errorDef} onPrimary={retryFromError} onSecondary={cancelFromError} />
      )}
    </KioskFrame>
  )
}

/**
 * 스크린샷/데모 모드 — URL `?error=<key>` 로 특정 오류 화면을 단독 렌더.
 * 예: /?error=qr-expired
 */
function ErrorPreview({ errorKey }: { errorKey: string }) {
  const def = ERRORS[errorKey]
  if (!def) {
    return (
      <KioskFrame>
        <div className="flex h-full items-center justify-center text-3xl text-muted-foreground">
          알 수 없는 오류 키: {errorKey}
        </div>
      </KioskFrame>
    )
  }
  return (
    <KioskFrame>
      <ErrorScreen def={def} />
    </KioskFrame>
  )
}

/**
 * 생체 신호 스캐닝 화면만 따로 확인하는 미리보기 - 실제 서버/하드웨어 없이
 * 버튼으로 waiting/measuring/done을 직접 넘겨볼 수 있다. 예: /?preview=vitals
 */
function VitalsPreview() {
  const TOTAL = 12
  const [phase, setPhase] = useState<VitalsScanPhase>('waiting')
  const [remaining, setRemaining] = useState(TOTAL)

  useEffect(() => {
    if (phase !== 'measuring') return
    setRemaining(TOTAL)
    const id = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  const fakeResult: VitalsResult = { temp_c: 36.6, heart_rate_bpm: 74, spo2_pct: 98 }

  return (
    <KioskFrame>
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1">
          <VitalsScanningOverlay
            phase={phase}
            remainingSeconds={remaining}
            totalSeconds={TOTAL}
            result={phase === 'done' ? fakeResult : null}
            username="테스트"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-4 pb-10">
          <button
            onClick={() => setPhase('waiting')}
            className="rounded-full border-2 border-primary px-8 py-4 text-2xl font-bold text-primary"
          >
            대기 (손 떼기)
          </button>
          <button
            onClick={() => setPhase('measuring')}
            className="rounded-full bg-primary px-8 py-4 text-2xl font-bold text-primary-foreground"
          >
            측정 시작 (손 올리기)
          </button>
          <button
            onClick={() => setPhase('done')}
            className="rounded-full border-2 border-primary px-8 py-4 text-2xl font-bold text-primary"
          >
            완료 (실제값 표시)
          </button>
        </div>
      </div>
    </KioskFrame>
  )
}

export default function App() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const errorKey = params?.get('error') ?? null
  const preview = params?.get('preview') ?? null

  return (
    <QueryClientProvider client={queryClient}>
      {preview === 'vitals' ? (
        <VitalsPreview />
      ) : errorKey ? (
        <ErrorPreview errorKey={errorKey} />
      ) : (
        <Kiosk />
      )}
    </QueryClientProvider>
  )
}
