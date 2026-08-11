import { useEffect, useRef, useState } from 'react'
import type { VitalsResult } from '@/screens/MeasuringScreen'

export type VitalsScanPhase = 'waiting' | 'measuring' | 'done'

interface VitalsScanningOverlayProps {
  phase: VitalsScanPhase
  /** 남은 시간(초) — measuring 단계에서 실제 센서(Teensy) 카운트다운 값 */
  remainingSeconds: number
  /** 전체 측정 시간(초) - Teensy 쪽 12초 측정과 동일 */
  totalSeconds?: number
  result: VitalsResult | null
  username: string
  /** waiting 단계 안내문 오버라이드 (예: 손이 떨어졌을 때) */
  message?: string
}

/**
 * 생체 신호 측정 중 보여주는 풀스크린 스캐닝 오버레이.
 * 측정 중(measuring)에는 원형 진행 링 + 회전하는 스캔 라인과 함께, 체온/심박수/
 * 산소포화도 자리에 그럴듯한 임의 숫자가 짧게 깜빡인다(순수 시각 효과, 실제
 * 값 아님) - 결과가 도착하면(done) 그 즉시 실제 측정값으로 자연스럽게 이어진다.
 */
export function VitalsScanningOverlay({
  phase,
  remainingSeconds,
  totalSeconds = 12,
  result,
  username,
  message,
}: VitalsScanningOverlayProps) {
  const progress =
    phase === 'done' ? 1 : Math.min(1, Math.max(0, (totalSeconds - remainingSeconds) / totalSeconds))

  const radius = 140
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  const temp = useCountUp(result?.temp_c, phase === 'done', { decimals: 1, min: 34, max: 38 })
  const hr = useCountUp(result?.heart_rate_bpm, phase === 'done', { decimals: 0, min: 55, max: 105 })
  const spo2 = useCountUp(result?.spo2_pct, phase === 'done', { decimals: 0, min: 90, max: 100 })

  return (
    <div className="relative flex h-full w-full flex-1 flex-col items-center justify-center overflow-hidden">
      {/* 옅은 스캔 그리드 배경 */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(hsl(214_90%_45%)_1px,transparent_1px),linear-gradient(90deg,hsl(214_90%_45%)_1px,transparent_1px)] [background-size:48px_48px]" />

      <p className="mb-6 text-3xl font-bold text-foreground">
        {phase === 'waiting' && message ? message : `${username}님, 손을 떼지 마세요`}
      </p>

      <div className="relative flex size-[360px] items-center justify-center">
        {/* 바깥쪽 펄스 링 */}
        <span className="animate-jarvis-pulse absolute inset-0 rounded-full border-2 border-primary/30" />
        <span className="animate-jarvis-pulse absolute inset-0 rounded-full border-2 border-primary/30 [animation-delay:1.2s]" />

        <svg width="360" height="360" viewBox="0 0 360 360" className="-rotate-90">
          <circle cx="180" cy="180" r={radius} fill="none" stroke="hsl(214 32% 91%)" strokeWidth="14" />
          <circle
            cx="180"
            cy="180"
            r={radius}
            fill="none"
            stroke="url(#jarvisGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 0.3s linear',
              filter: 'drop-shadow(0 0 8px hsl(214 90% 55% / 0.8))',
            }}
          />
          <defs>
            <linearGradient id="jarvisGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(199 95% 55%)" />
              <stop offset="100%" stopColor="hsl(230 90% 60%)" />
            </linearGradient>
          </defs>
        </svg>

        {/* 회전하는 스캔 라인 */}
        <div className="animate-jarvis-spin absolute inset-0 [mask-image:linear-gradient(90deg,transparent,black)]">
          <div className="absolute left-1/2 top-1/2 h-1/2 w-[2px] origin-top -translate-x-1/2 bg-gradient-to-b from-primary to-transparent" />
        </div>

        <div className="z-10 flex flex-col items-center gap-1">
          <span className="font-mono text-6xl font-black tabular-nums text-primary drop-shadow-[0_0_12px_hsl(214_90%_55%/0.6)]">
            {Math.round(progress * 100)}%
          </span>
          <span className="text-sm font-semibold tracking-[0.3em] text-muted-foreground">SCANNING</span>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-6">
        <VitalStat label="체온" value={temp} unit="°C" />
        <VitalStat label="심박수" value={hr} unit="BPM" />
        <VitalStat label="산소포화도" value={spo2} unit="%" />
      </div>
    </div>
  )
}

function VitalStat({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-white/70 px-6 py-4 shadow-lg shadow-primary/10 backdrop-blur">
      <span className="text-xs font-semibold tracking-widest text-muted-foreground">{label}</span>
      <span className="font-mono text-3xl font-bold tabular-nums text-foreground">
        {value == null ? '--' : value}
        <span className="ml-1 text-base font-medium text-muted-foreground">{unit}</span>
      </span>
    </div>
  )
}

interface CountUpOptions {
  decimals?: number
  min?: number
  max?: number
}

/**
 * done이 false인 동안: 120ms마다 [min, max] 사이의 그럴듯한 임의 숫자로
 * 깜빡인다("스캐닝 중" 서스펜스 효과 - 실제 측정값이 아니라 순수 시각적 노이즈).
 * done이 true가 되고 finalValue가 주어지는 순간, 깜빡임을 멈추고 마지막
 * 깜빡임 값에서 실제 값까지 약 600ms에 걸쳐 부드럽게 올라간다.
 */
function useCountUp(
  finalValue: number | null | undefined,
  done: boolean,
  { decimals = 0, min = 0, max = 100 }: CountUpOptions = {}
) {
  const [display, setDisplay] = useState<number | null>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    if (done) return
    const id = setInterval(() => {
      const v = min + Math.random() * (max - min)
      setDisplay(Number(v.toFixed(decimals)))
    }, 120)
    return () => clearInterval(id)
  }, [done, min, max, decimals])

  useEffect(() => {
    if (!done || finalValue == null) return
    const target = finalValue
    const start = display ?? target
    const startTime = performance.now()
    const durationMs = 600

    function tick(now: number) {
      const t = Math.min(1, (now - startTime) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      const v = start + (target - start) * eased
      setDisplay(Number(v.toFixed(decimals)))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, finalValue])

  return display
}
