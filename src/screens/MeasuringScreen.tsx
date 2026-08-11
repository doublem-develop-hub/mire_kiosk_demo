import { Check, ScanEye } from 'lucide-react'
import { VitalsScanningOverlay } from '@/screens/VitalsScanningOverlay'
import type { VitalsScanPhase } from '@/screens/VitalsScanningOverlay'

export type MeasuringStage = 'iris' | 'vitals_wait' | 'vitals_measuring' | 'vitals_result'

export interface VitalsResult {
  temp_c: number | null
  heart_rate_bpm: number | null
  spo2_pct: number | null
}

const VITALS_TOTAL_SECONDS = 12

interface MeasuringScreenProps {
  stage: MeasuringStage
  /** vitals_measuring 단계의 실제 남은 시간(초) — 센서(Teensy)가 보내는 값 */
  countdownSec: number | null
  /** vitals_wait 단계에서 손이 떨어졌을 때 등의 안내 문구 */
  waitMessage?: string
  /** vitals_result 단계에서 보여줄 최종 결과 */
  vitalsResult?: VitalsResult | null
  username: string
}

/** 상단 2단계 인디케이터 (① 홍채 인식 → ② 생체 신호) */
function StageSteps({ stage }: { stage: MeasuringStage }) {
  const onVitals = stage !== 'iris'
  const vitalsDone = stage === 'vitals_result'
  const items = [
    { n: 1, label: '홍채 인식', active: !onVitals, done: onVitals },
    { n: 2, label: '생체 신호', active: onVitals, done: vitalsDone },
  ]
  return (
    <div className="flex items-center justify-center gap-5">
      {items.map((it, i) => (
        <div key={it.n} className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-14 items-center justify-center rounded-full text-2xl font-bold transition-colors ${
                it.active || it.done
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary/10 text-primary/50'
              }`}
            >
              {it.done ? <Check className="size-7" strokeWidth={3} /> : it.n}
            </span>
            <span
              className={`text-2xl font-semibold transition-colors ${
                it.active ? 'text-foreground' : 'text-muted-foreground/60'
              }`}
            >
              {it.label}
            </span>
          </div>
          {i === 0 && <span className="h-px w-16 bg-primary/20" />}
        </div>
      ))}
    </div>
  )
}

const VITALS_SCAN_PHASE: Record<MeasuringStage, VitalsScanPhase | null> = {
  iris: null,
  vitals_wait: 'waiting',
  vitals_measuring: 'measuring',
  vitals_result: 'done',
}

/**
 * 측정 화면 — 실제 하드웨어 이벤트(WebSocket)로 진행된다. 생체 신호 단계는
 * VitalsScanningOverlay가 전담하고(측정 중 표시되는 수치는 순수 시각 효과이며
 * 결과가 오면 실제 값으로 이어짐), 홍채 인식 단계만 여기서 직접 그린다.
 */
export function MeasuringScreen({
  stage,
  countdownSec,
  waitMessage,
  vitalsResult,
  username,
}: MeasuringScreenProps) {
  const vitalsPhase = VITALS_SCAN_PHASE[stage]

  return (
    <div className="flex h-full flex-col items-center justify-center gap-14">
      <StageSteps stage={stage} />

      {stage === 'iris' && (
        <div className="flex flex-col items-center gap-10 text-center">
          <div className="relative flex size-64 items-center justify-center">
            <span className="absolute inline-flex size-full animate-spin rounded-full border-8 border-primary/15 border-t-primary [animation-duration:1.4s]" />
            <ScanEye className="size-24 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-6xl font-extrabold tracking-tight text-foreground">
              홍채를 인식하고 있어요
            </h2>
            <p className="mt-5 text-3xl font-medium text-muted-foreground">
              화면 상단의 카메라를 바라봐 주세요
            </p>
          </div>
        </div>
      )}

      {vitalsPhase && (
        <VitalsScanningOverlay
          phase={vitalsPhase}
          remainingSeconds={countdownSec ?? VITALS_TOTAL_SECONDS}
          totalSeconds={VITALS_TOTAL_SECONDS}
          result={vitalsResult ?? null}
          username={username}
          message={waitMessage}
        />
      )}
    </div>
  )
}
