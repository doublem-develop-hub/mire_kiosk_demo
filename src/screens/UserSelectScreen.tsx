import { useEffect, useState } from 'react'
import { UserRound, Clock } from 'lucide-react'
import type { KioskUser } from '@/screens/ScannedScreen'
import type { RosterResponse } from '@/lib/api'
import { checkTypeForTime } from '@/kiosk/checkType'

/**
 * 본인 확인 화면 — QR 스캔 대신 부서별 명단에서 본인 이름을 직접 눌러 확인한다.
 * (iris_enroll_app의 부서별 이름 버튼 방식과 동일). 명단/구분은 /api/roster에서 받아온다.
 * 출근/점심/퇴근은 서버가 실제 시각으로 판단해 저장하므로(클라이언트 값은 무시됨),
 * 여기서도 누르는 버튼이 아니라 지금 시각 기준으로 자동 표시만 한다.
 */
export function UserSelectScreen({
  roster,
  checkTypes,
  onSelect,
}: {
  roster: RosterResponse['roster']
  checkTypes: string[]
  onSelect: (user: KioskUser, checkType: string) => void
}) {
  const [checkType, setCheckType] = useState(() => checkTypeForTime())

  useEffect(() => {
    const tick = () => setCheckType(checkTypeForTime())
    const interval = setInterval(tick, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-full flex-col gap-8">
      <header className="text-center">
        <h2 className="text-6xl font-extrabold tracking-tight text-foreground">
          본인 이름을 눌러 주세요
        </h2>
        <p className="mt-4 text-3xl font-medium text-muted-foreground">
          명단에서 본인을 찾아 선택해 주세요
        </p>
      </header>

      {/* 구분 표시 — 출근/점심/퇴근, 현재 시각 기준 자동 판단 (선택 불가) */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex justify-center gap-4">
          {checkTypes.map((type) => (
            <span
              key={type}
              className={`rounded-full px-12 py-5 text-3xl font-bold ${
                checkType === type
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'border border-border bg-white text-muted-foreground/50'
              }`}
            >
              {type}
            </span>
          ))}
        </div>
        <p className="flex items-center gap-1.5 text-lg text-muted-foreground">
          <Clock className="size-4" />
          현재 시각 기준으로 자동 선택돼요
        </p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-3xl border border-border bg-white/70 p-10 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-8">
          {roster.map(({ dept, names }) => (
            <section key={dept}>
              <p className="mb-4 text-xl font-bold uppercase tracking-[0.25em] text-primary/70">
                {dept}
              </p>
              <div className="grid grid-cols-3 gap-4">
                {names.map((name) => (
                  <button
                    key={name}
                    onClick={() => onSelect({ name, dept }, checkType)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-white py-6 text-3xl font-bold text-foreground shadow-sm transition-transform active:scale-95 active:bg-primary/10"
                  >
                    <UserRound className="size-7 text-primary" strokeWidth={1.9} />
                    {name}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
