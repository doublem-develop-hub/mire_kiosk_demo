import { Check, Smartphone, CalendarClock, ListChecks, Timer, HeartPulse, Thermometer, Droplet } from 'lucide-react'
import { MEASURE_LABELS } from '@/kiosk/steps'
import type { VitalsResult } from '@/screens/MeasuringScreen'

export interface MeasureSummary {
  /** 측정 일시 */
  measuredAt: Date
  /** 소요 시간(초) */
  durationSec: number
  /** 실제 측정된 생체 신호 (센서가 없거나 시간 초과면 값이 없을 수 있음) */
  vitals: VitalsResult
}

interface DoneScreenProps {
  summary: MeasureSummary
  secondsLeft: number
  onHome: () => void
}

/** 측정 일시 포맷: YYYY.MM.DD HH:mm */
function formatMeasuredAt(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/**
 * 완료 화면 — 측정 요약(일시/항목/소요시간)에 이어 실제로 측정된 체온·심박수·
 * 산소포화도를 보여준다. AI 스트레스 위험도 분석 결과만 앱에서 확인하도록 안내.
 */
export function DoneScreen({ summary, secondsLeft, onHome }: DoneScreenProps) {
  const rows = [
    {
      icon: CalendarClock,
      label: '측정 일시',
      value: formatMeasuredAt(summary.measuredAt),
    },
    {
      icon: ListChecks,
      label: '측정 항목',
      value: MEASURE_LABELS.join(' · '),
    },
    {
      icon: Timer,
      label: '소요 시간',
      value: `${summary.durationSec}초`,
    },
  ]

  const vitalsRows = [
    { icon: Thermometer, label: '체온', value: summary.vitals.temp_c, unit: '°C', decimals: 1 },
    { icon: HeartPulse, label: '심박수', value: summary.vitals.heart_rate_bpm, unit: 'bpm', decimals: 0 },
    { icon: Droplet, label: '산소포화도', value: summary.vitals.spo2_pct, unit: '%', decimals: 0 },
  ].filter((row) => row.value != null)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-10">
      {/* 완료 표시 */}
      <div className="flex flex-col items-center gap-7">
        <div className="animate-pop flex size-32 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40">
          <Check className="size-20" strokeWidth={2.4} />
        </div>
        <h2 className="animate-fade-up text-6xl font-extrabold tracking-tight text-foreground">
          측정을 완료했어요
        </h2>
      </div>

      {/* 측정 요약 */}
      <div className="animate-fade-up w-full max-w-[46rem] divide-y divide-border rounded-3xl border border-border bg-white">
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <div
              key={row.label}
              className="flex items-center gap-5 px-9 py-6 text-left"
            >
              <Icon className="size-8 shrink-0 text-primary" />
              <span className="w-32 text-2xl text-muted-foreground">
                {row.label}
              </span>
              <span className="flex-1 text-right text-3xl font-bold text-foreground">
                {row.value}
              </span>
            </div>
          )
        })}
      </div>

      {/* 실제 측정된 생체 신호 */}
      {vitalsRows.length > 0 && (
        <div className="animate-fade-up grid w-full max-w-[46rem] grid-cols-3 gap-4">
          {vitalsRows.map((row) => {
            const Icon = row.icon
            return (
              <div
                key={row.label}
                className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-white px-4 py-6 text-center"
              >
                <Icon className="size-8 text-primary" strokeWidth={1.8} />
                <p className="text-xl text-muted-foreground">{row.label}</p>
                <p>
                  <span className="text-4xl font-extrabold tabular-nums text-foreground">
                    {(row.value as number).toFixed(row.decimals)}
                  </span>
                  <span className="ml-1 text-lg font-semibold text-muted-foreground">{row.unit}</span>
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* AI 분석 결과는 앱에서 확인 */}
      <div className="animate-fade-up flex w-full max-w-[46rem] items-center gap-5 rounded-3xl bg-primary/5 px-9 py-6">
        <Smartphone className="size-11 shrink-0 text-primary" />
        <p className="text-left text-2xl font-semibold leading-relaxed text-foreground">
          AI 스트레스 위험도 분석 결과는
          <br />
          <span className="text-primary">Mire 앱</span>에서 확인해 주세요.
        </p>
      </div>

      {/* 액션 */}
      <div className="mt-2 flex flex-col items-center gap-4">
        <button
          onClick={onHome}
          className="rounded-full border-2 border-primary px-16 py-5 text-3xl font-bold text-primary transition-transform active:scale-95"
        >
          처음으로
        </button>
        <p className="text-xl text-muted-foreground">
          {secondsLeft}초 후 대기 화면으로 돌아가요
        </p>
      </div>
    </div>
  )
}
