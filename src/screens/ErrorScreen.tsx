import { RotateCcw, Home, PhoneCall } from 'lucide-react'
import type { ErrorDef } from '@/kiosk/errors'
import { SEVERITY_COLOR } from '@/kiosk/errors'

interface ErrorScreenProps {
  def: ErrorDef
  /** 주 버튼 동작 (다시 시도 / 처음으로 등) */
  onPrimary?: () => void
  /** 보조 버튼 동작 */
  onSecondary?: () => void
  /** 카운트다운 남은 초 (def.countdown 사용 시) */
  secondsLeft?: number
}

/**
 * 공용 오류/예외 화면.
 * 강도(retry·warning·system)에 따라 강조 색을 바꾸고,
 * 시스템 오류는 오류 코드·관리자 호출 안내를 함께 노출한다.
 */
export function ErrorScreen({
  def,
  onPrimary,
  onSecondary,
  secondsLeft,
}: ErrorScreenProps) {
  const accent = SEVERITY_COLOR[def.severity]
  const isSystem = def.severity === 'system'
  const PrimaryIcon = def.contact ? PhoneCall : RotateCcw

  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 text-center">
      {/* 단계 배지 */}
      <span
        className="animate-fade-up rounded-full px-7 py-3 text-2xl font-bold"
        style={{ color: accent, backgroundColor: `${accent}1a` }}
      >
        {def.stage}
      </span>

      {/* 아이콘 배지 */}
      <div
        className="animate-pop flex size-40 items-center justify-center rounded-full shadow-2xl"
        style={{ backgroundColor: accent, boxShadow: `0 25px 50px -12px ${accent}66` }}
      >
        <def.icon className="size-24 text-white" strokeWidth={1.7} />
      </div>

      {/* 제목 · 설명 */}
      <div className="animate-fade-up">
        <h2 className="text-6xl font-extrabold leading-tight tracking-tight text-foreground">
          {def.title}
        </h2>
        <p className="mt-6 whitespace-pre-line text-3xl font-medium leading-relaxed text-muted-foreground">
          {def.message}
        </p>
      </div>

      {/* 시스템 오류 코드 */}
      {def.code && (
        <div
          className="animate-fade-up flex items-center gap-3 rounded-2xl border px-7 py-4"
          style={{ borderColor: `${accent}40`, backgroundColor: `${accent}0d` }}
        >
          <span className="text-xl font-semibold text-muted-foreground">
            오류 코드
          </span>
          <span
            className="font-mono text-2xl font-bold tracking-widest"
            style={{ color: accent }}
          >
            {def.code}
          </span>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="animate-fade-up mt-2 flex flex-col items-center gap-5">
        <button
          onClick={onPrimary}
          className="flex items-center justify-center gap-4 rounded-full px-20 py-7 text-4xl font-bold text-white shadow-xl transition-transform active:scale-95"
          style={{ backgroundColor: accent, boxShadow: `0 20px 40px -12px ${accent}55` }}
        >
          <PrimaryIcon className="size-9" strokeWidth={2.2} />
          {def.primary}
        </button>

        {def.secondary && (
          <button
            onClick={onSecondary}
            className="flex items-center gap-3 rounded-full border-2 px-14 py-5 text-3xl font-bold transition-transform active:scale-95"
            style={{ borderColor: `${accent}55`, color: accent }}
          >
            {def.secondary === '처음으로' && <Home className="size-8" />}
            {def.secondary}
          </button>
        )}
      </div>

      {/* 관리자 호출 안내 (시스템 오류) */}
      {isSystem && def.contact && (
        <p className="text-xl text-muted-foreground">
          문제가 계속되면 매장 직원에게 문의해 주세요
        </p>
      )}

      {/* 자동 복귀 카운트다운 */}
      {def.countdown != null && (
        <p className="text-xl text-muted-foreground">
          {secondsLeft ?? def.countdown}초 후 대기 화면으로 돌아가요
        </p>
      )}
    </div>
  )
}
