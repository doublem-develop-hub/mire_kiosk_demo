import {
  Clock,
  ScanLine,
  UserX,
  ScanEye,
  Hand,
  TimerOff,
  Cpu,
  WifiOff,
  ServerCrash,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * 오류 강도.
 * - retry  : 사용자가 다시 하면 되는 회복 가능 오류 (브랜드 블루)
 * - warning: 안내가 필요한 중단성 오류 (앰버)
 * - system : 하드웨어/네트워크 등 관리자 조치가 필요한 오류 (레드)
 */
export type ErrorSeverity = 'retry' | 'warning' | 'system'

export interface ErrorDef {
  key: string
  severity: ErrorSeverity
  /** 상단 단계 배지 (예: QR 인증 · 홍채 인식) */
  stage: string
  icon: LucideIcon
  title: string
  /** 원인/조치 안내 (줄바꿈은 \n) */
  message: string
  /** 주 버튼 라벨 */
  primary: string
  /** 보조 버튼 라벨 (선택) */
  secondary?: string
  /** 시스템 오류 코드 (관리자용, 선택) */
  code?: string
  /** 관리자 호출 안내 노출 여부 */
  contact?: boolean
  /** 자동 복귀 카운트다운(초) 노출 여부 */
  countdown?: number
}

/** 강도별 강조 색상 (index.css 토큰과 동일) */
export const SEVERITY_COLOR: Record<ErrorSeverity, string> = {
  retry: 'hsl(221 83% 53%)', // 브랜드 블루
  warning: 'hsl(38 92% 50%)', // 경고 앰버
  system: 'hsl(0 84% 60%)', // 위험 레드
}

export const ERRORS: Record<string, ErrorDef> = {
  // ── QR 인증 단계 ─────────────────────────────
  'qr-expired': {
    key: 'qr-expired',
    severity: 'warning',
    stage: 'QR 인증',
    icon: Clock,
    title: 'QR 코드가 만료되었어요',
    message:
      'QR 코드의 유효 시간이 지났어요.\nMire 앱에서 QR 코드를 다시 발급받아 주세요.',
    primary: '처음으로',
    countdown: 15,
  },
  'qr-failed': {
    key: 'qr-failed',
    severity: 'retry',
    stage: 'QR 인증',
    icon: ScanLine,
    title: 'QR 코드를 인식하지 못했어요',
    message:
      '코드가 잘 보이도록 리더기 중앙에 맞춰 주세요.\n화면 밝기를 최대로 하면 인식이 더 잘 돼요.',
    primary: '다시 시도',
    secondary: '처음으로',
  },
  'user-unregistered': {
    key: 'user-unregistered',
    severity: 'warning',
    stage: 'QR 인증',
    icon: UserX,
    title: '등록되지 않은 사용자예요',
    message:
      '회원 정보를 찾을 수 없어요.\nMire 앱에서 회원가입 후 다시 이용해 주세요.',
    primary: '처음으로',
    countdown: 15,
  },

  // ── 홍채 인식 단계 ───────────────────────────
  'iris-failed': {
    key: 'iris-failed',
    severity: 'retry',
    stage: '홍채 인식',
    icon: ScanEye,
    title: '홍채를 인식하지 못했어요',
    message:
      '화면 상단의 카메라를 정면으로 바라봐 주세요.\n안경에 빛이 반사되면 잠시 벗어 주세요.',
    primary: '다시 시도',
    secondary: '처음으로',
  },

  // ── 생체 신호 측정 단계 ──────────────────────
  'hand-removed': {
    key: 'hand-removed',
    severity: 'retry',
    stage: '생체 신호',
    icon: Hand,
    title: '손이 감지되지 않아요',
    message:
      '측정이 끝날 때까지 패널에서 손을 떼지 말아 주세요.\n손바닥 전체를 패널에 밀착해 주세요.',
    primary: '다시 시도',
    secondary: '처음으로',
  },
  'measure-timeout': {
    key: 'measure-timeout',
    severity: 'warning',
    stage: '생체 신호',
    icon: TimerOff,
    title: '측정 시간이 초과되었어요',
    message:
      '정상적으로 측정하지 못했어요.\n처음부터 다시 시도해 주세요.',
    primary: '처음으로',
    countdown: 15,
  },
  'sensor-error': {
    key: 'sensor-error',
    severity: 'system',
    stage: '생체 신호',
    icon: Cpu,
    title: '센서에 문제가 발생했어요',
    message:
      '측정 센서가 정상적으로 동작하지 않아요.\n잠시 후 다시 시도하거나 관리자를 호출해 주세요.',
    primary: '다시 시도',
    secondary: '관리자 호출',
    code: 'E-SENSOR-503',
    contact: true,
  },

  // ── AI 분석 · 네트워크 ───────────────────────
  'network-error': {
    key: 'network-error',
    severity: 'system',
    stage: '결과 전송',
    icon: WifiOff,
    title: '네트워크 연결이 불안정해요',
    message:
      '인터넷 연결 상태를 확인하고 있어요.\n잠시만 기다려 주세요.',
    primary: '다시 시도',
    code: 'E-NET-001',
  },
  'analyze-failed': {
    key: 'analyze-failed',
    severity: 'system',
    stage: 'AI 분석',
    icon: ServerCrash,
    title: '분석 중 문제가 발생했어요',
    message:
      '측정 데이터를 분석하지 못했어요.\n잠시 후 다시 시도해 주세요.',
    primary: '다시 시도',
    secondary: '처음으로',
    code: 'E-AI-500',
  },

  // ── 시스템 (단계 무관) ───────────────────────
  'out-of-service': {
    key: 'out-of-service',
    severity: 'system',
    stage: '시스템',
    icon: Wrench,
    title: '현재 점검 중이에요',
    message:
      '기기를 점검하고 있어요.\n이용에 불편을 드려 죄송합니다.',
    primary: '관리자 호출',
    code: 'E-SYS-000',
    contact: true,
  },
}

/** 스크린샷/데모용 오류 키 목록 (표시 순서) */
export const ERROR_KEYS = Object.keys(ERRORS)
