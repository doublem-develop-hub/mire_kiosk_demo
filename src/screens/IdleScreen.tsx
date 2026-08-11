import {
  ArrowRight,
  UserRound,
  Activity,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ESTIMATED_MEASURE_SEC, MEASURE_LABELS } from '@/kiosk/steps'

/** 전체 이용 흐름 */
const FLOW: { icon: LucideIcon; label: string }[] = [
  { icon: UserRound, label: '본인 확인' },
  { icon: Activity, label: '측정 진행' },
  { icon: CheckCircle2, label: '결과 확인' },
]

/** 대기 화면 — 브랜드 · 이용 안내 · 시작 CTA를 중앙 정렬 컴포지션으로 구성 */
export function IdleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-14">
      {/* ── 브랜드 ─────────────────────────────── */}
      <header className="flex flex-col items-center text-center">
        <img
          src="/favicon.svg"
          alt="MIRE"
          className="size-20 rounded-[1.4rem] shadow-lg shadow-primary/20"
        />
        <h1 className="mt-6 text-8xl font-extrabold tracking-tight text-foreground">
          MIRE
        </h1>
        <p className="mt-4 text-2xl font-semibold uppercase tracking-[0.4em] text-primary">
          AI Wellness Kiosk
        </p>
        <p className="mt-6 max-w-[24ch] text-3xl font-medium leading-relaxed text-muted-foreground">
          홍채·심박수·체온·산소포화도를 측정해 AI가 스트레스 위험도를 분석합니다.
        </p>
      </header>

      {/* ── 이용 안내 카드 ───────────────────────── */}
      <section className="w-full max-w-[46rem] rounded-3xl border border-border bg-white/70 p-10 shadow-sm backdrop-blur-sm">
        <p className="mb-8 text-center text-lg font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          이용 안내
        </p>

        <ol className="relative mx-auto flex max-w-[32rem] flex-col gap-6">
          <span className="absolute left-8 top-6 bottom-6 w-px bg-primary/15" />
          {FLOW.map((step, i) => {
            const Icon = step.icon
            return (
              <li key={step.label} className="relative flex items-center gap-6">
                <div className="z-10 flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-primary/10">
                  <Icon className="size-8" strokeWidth={1.9} />
                </div>
                <span className="text-lg font-bold tabular-nums text-primary/50">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-3xl font-semibold text-foreground">
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>

        <div className="mx-auto mt-8 flex max-w-[32rem] items-center justify-between rounded-2xl bg-primary/5 px-8 py-5">
          <div className="flex items-center gap-3 text-primary">
            <Clock className="size-7" />
            <span className="text-3xl font-bold text-foreground">
              약 {ESTIMATED_MEASURE_SEC}초
            </span>
          </div>
          <span className="h-7 w-px bg-primary/15" />
          <span className="text-xl font-semibold text-muted-foreground">
            {MEASURE_LABELS.join(' · ')}
          </span>
        </div>
      </section>

      {/* ── 시작 CTA ───────────────────────────── */}
      <div className="flex w-full max-w-[46rem] flex-col items-center">
        <button
          onClick={onStart}
          className="group flex w-full items-center justify-center gap-4 rounded-full bg-primary py-7 text-4xl font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-transform active:scale-95"
        >
          시작하기
          <ArrowRight className="size-9 transition-transform group-active:translate-x-1" />
        </button>
        <div className="mt-6 flex items-center gap-3 text-xl text-muted-foreground">
          <UserRound className="size-6 text-primary" />
          다음 화면에서 명단 속 본인 이름을 눌러 주세요
        </div>
      </div>
    </div>
  )
}
