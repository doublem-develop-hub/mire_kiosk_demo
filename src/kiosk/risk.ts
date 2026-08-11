import { ShieldCheck, TriangleAlert, OctagonAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** AI가 판별하는 스트레스 위험도 등급 */
export type RiskLevel = 'stable' | 'caution' | 'danger'

export interface RiskInfo {
  level: RiskLevel
  label: string
  message: string
  icon: LucideIcon
  /** 등급별 강조 색상 (hsl) */
  color: string
}

export const RISK: Record<RiskLevel, RiskInfo> = {
  stable: {
    level: 'stable',
    label: '안정',
    message: '스트레스 지표가 안정 범위에 있습니다.',
    icon: ShieldCheck,
    color: 'hsl(221 83% 53%)', // 브랜드 블루
  },
  caution: {
    level: 'caution',
    label: '주의',
    message: '스트레스 지표가 다소 높습니다. 휴식을 권장합니다.',
    icon: TriangleAlert,
    color: 'hsl(38 92% 50%)', // 경고 앰버
  },
  danger: {
    level: 'danger',
    label: '위험',
    message: '스트레스 지표가 높습니다. 전문가 상담을 권장합니다.',
    icon: OctagonAlert,
    color: 'hsl(0 84% 60%)', // 위험 레드
  },
}

/**
 * 데모용 스트레스 위험도 판별.
 * 실제로는 수집된 센서 데이터를 AI 모델에 전달해 등급을 받는다.
 */
export function analyzeRisk(): RiskLevel {
  return 'stable'
}
