import { ScanEye, HeartPulse, Thermometer, Droplet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** 키오스크 측정 단계 정의 */
export interface MeasureStep {
  key: string
  label: string
  /** 상단 스테퍼에 쓰는 짧은 라벨 */
  short: string
  hint: string
  icon: LucideIcon
  /** 측정에 걸리는(연출) 시간(ms) */
  duration: number
  /** 완료 후 표시할 결과 값 (데모용) */
  result: string
  unit?: string
}

export const MEASURE_STEPS: MeasureStep[] = [
  {
    key: 'iris',
    label: '홍채 스트레스 링 분석',
    short: '홍채',
    hint: '패널의 카메라를 바라봐 주세요',
    icon: ScanEye,
    duration: 3200,
    result: '분석 완료',
  },
  {
    key: 'heart',
    label: '심박수',
    short: '심박수',
    hint: '패널에 손바닥을 올려 주세요',
    icon: HeartPulse,
    duration: 3000,
    result: '72',
    unit: 'bpm',
  },
  {
    key: 'temp',
    label: '체온',
    short: '체온',
    hint: '손바닥을 패널에 댄 채 기다려 주세요',
    icon: Thermometer,
    duration: 2600,
    result: '36.5',
    unit: '°C',
  },
  {
    key: 'spo2',
    label: '산소포화도 (SpO₂)',
    short: 'SpO₂',
    hint: '손가락 끝을 패널의 센서에 대주세요',
    icon: Droplet,
    duration: 2800,
    result: '98',
    unit: '%',
  },
]

/** 측정 항목 짧은 라벨 목록 (예: 홍채 · 심박수 · 체온 · SpO₂) */
export const MEASURE_LABELS = MEASURE_STEPS.map((s) => s.short)

/** 전체 측정 소요(연출) 시간 합계(ms) */
export const TOTAL_MEASURE_MS = MEASURE_STEPS.reduce(
  (sum, s) => sum + s.duration,
  0
)

/** 예상 측정 시간(초, 올림) — 대기 화면 안내용 */
export const ESTIMATED_MEASURE_SEC = Math.ceil(TOTAL_MEASURE_MS / 1000)
