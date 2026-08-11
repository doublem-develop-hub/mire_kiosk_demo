import { Check, UserRound } from 'lucide-react'

export interface KioskUser {
  name: string
  dept: string
}

/** 본인 확인 완료 화면 — 선택한 이름/부서/구분을 표시한 뒤 측정 단계로 자동 진행 */
export function ScannedScreen({
  user,
  checkType,
}: {
  user: KioskUser
  checkType: string
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-9 text-center">
      <div className="animate-pop flex size-32 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40">
        <Check className="size-20" strokeWidth={2.4} />
      </div>

      <h2 className="animate-fade-up text-6xl font-extrabold tracking-tight text-foreground">
        본인 확인 완료
      </h2>

      <div className="animate-fade-up flex items-center gap-4 rounded-full border border-border bg-white px-9 py-4 shadow-sm">
        <UserRound className="size-8 text-primary" />
        <span className="text-3xl font-bold text-foreground">{user.name}</span>
        <span className="text-2xl font-medium tracking-wide text-muted-foreground">
          {user.dept}
        </span>
        <span className="rounded-full bg-primary/10 px-5 py-1.5 text-2xl font-bold text-primary">
          {checkType}
        </span>
      </div>

      <p className="animate-fade-up text-3xl font-medium leading-relaxed text-muted-foreground">
        본인 확인이 완료되었어요.
        <br />
        지금부터 측정을 시작할게요.
      </p>
    </div>
  )
}
