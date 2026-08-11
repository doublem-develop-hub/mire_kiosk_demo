import type { StressLevel } from '@/lib/api'

const HINTS: Record<number, string> = {
  1: '매우 낮음',
  2: '낮음',
  3: '보통',
  4: '높음',
  5: '매우 높음',
}

/**
 * 스트레스 자가진단 — iris_enroll_app의 촬영 전 설문 다이얼로그(1~5점)와 동일.
 * 응답은 측정 시작(POST /api/visits)과 함께 서버로 전달되어 stress_survey.xlsx에 기록된다.
 */
export function StressScreen({
  levels,
  onSubmit,
}: {
  levels: StressLevel[]
  onSubmit: (level: StressLevel) => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-14 text-center">
      <header>
        <h2 className="text-6xl font-extrabold tracking-tight text-foreground">
          현재 스트레스가 어느 정도인가요?
        </h2>
        <p className="mt-5 text-3xl font-medium text-muted-foreground">
          1점(매우 낮음) ~ 5점(매우 높음)
        </p>
      </header>

      <div className="grid grid-cols-5 gap-6">
        {levels.map((level) => (
          <button
            key={level.label}
            onClick={() => onSubmit(level)}
            className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-white px-8 py-10 shadow-sm transition-transform active:scale-95 active:bg-primary/10"
          >
            <span className="text-6xl font-extrabold text-primary">{level.label}</span>
            <span className="text-xl font-semibold text-muted-foreground">
              {HINTS[level.score] ?? ''}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
