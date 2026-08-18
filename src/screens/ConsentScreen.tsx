import { ScanEye, HeartPulse, UserRound, ShieldCheck } from 'lucide-react'

const COLLECTED_ITEMS = [
  { icon: UserRound, text: '성함' },
  { icon: ScanEye, text: '홍채 이미지' },
  { icon: HeartPulse, text: '체온 · 심박수 · 산소포화도, 스트레스 자가진단 응답' },
]

/**
 * 박람회 시연용 개인정보 수집 동의 화면 - 회사 동료 명단이 아니라 현장의
 * 불특정 방문객이 체험하므로, 이름 입력 전에 어떤 정보를 왜 수집하는지
 * 먼저 알리고 동의를 받는다.
 */
export function ConsentScreen({
  onAgree,
  onDecline,
}: {
  onAgree: () => void
  onDecline: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 text-center">
      <div className="flex flex-col items-center gap-4">
        <ShieldCheck className="size-16 text-primary" strokeWidth={1.6} />
        <h2 className="text-6xl font-extrabold tracking-tight text-foreground">
          체험 전 안내
        </h2>
        <p className="max-w-[36ch] text-3xl font-medium leading-relaxed text-muted-foreground">
          체험을 위해 아래 정보를 수집합니다.
          <br />
          박람회 시연 목적으로만 사용되며 그 외 용도로 쓰이지 않습니다.
        </p>
      </div>

      <div className="w-full max-w-[42rem] divide-y divide-border rounded-3xl border border-border bg-white/70 backdrop-blur-sm">
        {COLLECTED_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.text} className="flex items-center gap-5 px-9 py-6 text-left">
              <Icon className="size-8 shrink-0 text-primary" strokeWidth={1.8} />
              <span className="text-2xl font-semibold text-foreground">{item.text}</span>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onAgree}
          className="rounded-full bg-primary px-16 py-7 text-4xl font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-transform active:scale-95"
        >
          동의하고 시작하기
        </button>
        <button
          onClick={onDecline}
          className="text-xl font-semibold text-muted-foreground underline underline-offset-4"
        >
          동의하지 않음
        </button>
      </div>
    </div>
  )
}
