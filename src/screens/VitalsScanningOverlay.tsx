import { useEffect, useRef, useState } from 'react'
import { Hand, Activity } from 'lucide-react'
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
 * 생체 신호 측정 중 보여주는 오버레이.
 *
 * 링/파동/중앙 텍스트는 전부 absolute + inset-0로 같은 22.5rem 박스 위에
 * 완전히 겹쳐 쌓는다 - flex-row로 나열하면 옆으로 밀려나고(이전 버그), CSS
 * grid의 auto 트랙에 올리면 place-items-center가 트랙을 내용 크기로 줄여버려
 * size-full이 무시된다(두 번째 버그) - "여러 레이어가 정확히 같은 중심/크기를
 * 공유해야 하는" 구조는 absolute+inset-0가 가장 확실하다.
 *
 * 톤은 의료기기/헬스케어 키오스크에 맞게 절제한다 - 링은 단색, 파동은 하나만,
 * 숫자는 모노스페이스 대신 기본 산세리프(Pretendard) - 과한 SF/네온 느낌 대신
 * 토스류 앱들이 쓰는 "차분하고 신뢰감 있는" 무드에 가깝게.
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

  const justArrived = useJustArrived(phase === 'done' && result != null)

  return (
    <div className="relative flex h-full w-full flex-1 flex-col items-center justify-center overflow-hidden">
      <div className="text-center">
        <p className="text-3xl font-bold text-foreground">
          {phase === 'waiting' ? message ?? `${username}님, 패널에 손을 올려주세요` : `${username}님, 손을 떼지 마세요`}
        </p>
        {phase !== 'waiting' && (
          <p className="mt-2 text-lg text-muted-foreground">센서가 생체 정보를 측정하고 있습니다.</p>
        )}
      </div>

      {phase === 'waiting' ? (
        <div className="relative mt-10 size-[22.5rem]">
          <span className="animate-sensor-ripple absolute inset-0 m-auto size-48 rounded-full bg-primary/10" />
          <div className="absolute inset-0 m-auto flex size-48 items-center justify-center rounded-full bg-primary/10">
            <Hand className="size-20 text-primary" strokeWidth={1.5} />
          </div>
        </div>
      ) : (
        <div className="relative mt-10 size-[22.5rem]">
          {/* 중앙에서 은은하게 퍼지는 파동 - 센서가 데이터를 읽고 있다는 느낌. absolute+inset-0로
              항상 링/텍스트와 같은 중심(22.5rem 박스의 정중앙)을 공유한다. */}
          <span className="animate-sensor-ripple absolute inset-0 m-auto size-44 rounded-full bg-primary/10" />

          <svg viewBox="0 0 360 360" className="absolute inset-0 size-full -rotate-90">
            <circle cx="180" cy="180" r={radius} fill="none" stroke="hsl(214 32% 91%)" strokeWidth="14" />
            <circle
              cx="180"
              cy="180"
              r={radius}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <Activity className="size-9 text-primary/70" strokeWidth={1.6} />
            <span className="text-6xl font-black tabular-nums text-primary">{Math.round(progress * 100)}%</span>
            <span className="text-sm font-semibold tracking-[0.2em] text-muted-foreground">측정 중</span>
          </div>
        </div>
      )}

      <div className="mt-10 grid grid-cols-3 gap-6">
        <VitalStat label="체온" value={result?.temp_c ?? null} unit="°C" decimals={1} highlight={justArrived} />
        <VitalStat label="심박수" value={result?.heart_rate_bpm ?? null} unit="BPM" decimals={0} highlight={justArrived} />
        <VitalStat label="산소포화도" value={result?.spo2_pct ?? null} unit="%" decimals={0} highlight={justArrived} />
      </div>
    </div>
  )
}

function VitalStat({
  label,
  value,
  unit,
  decimals,
  highlight,
}: {
  label: string
  value: number | null
  unit: string
  decimals: number
  highlight: boolean
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-2xl px-6 py-5 transition-[background-color,transform] duration-700 ${
        highlight ? 'scale-105 bg-primary/12' : 'bg-primary/5'
      }`}
    >
      <span className="text-xs font-semibold tracking-widest text-muted-foreground">{label}</span>
      <span className="text-3xl font-bold tabular-nums text-foreground">
        {value == null ? '--' : value.toFixed(decimals)}
        <span className="ml-1 text-base font-medium text-muted-foreground">{unit}</span>
      </span>
    </div>
  )
}

/** 값이 null -> 실제 값으로 바뀐 순간 true, 약 1.4초 뒤 자동으로 false로 돌아간다. */
function useJustArrived(arrived: boolean) {
  const [highlight, setHighlight] = useState(false)
  const wasArrived = useRef(false)

  useEffect(() => {
    if (arrived && !wasArrived.current) {
      setHighlight(true)
      const timer = setTimeout(() => setHighlight(false), 1400)
      wasArrived.current = true
      return () => clearTimeout(timer)
    }
    if (!arrived) {
      wasArrived.current = false
      setHighlight(false)
    }
  }, [arrived])

  return highlight
}
