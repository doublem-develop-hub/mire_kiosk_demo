import { useState } from 'react'
import { ArrowRight, UserRound } from 'lucide-react'

export interface KioskUser {
  name: string
}

/**
 * 박람회 방문객용 이름 입력 화면 - 사내 명단 버튼 대신, 처음 보는 사람도
 * 쓸 수 있게 직접 입력받는다. 별도 화면 키보드는 만들지 않고 input을 눌렀을
 * 때 태블릿 자체 키보드(한글 포함)가 뜨도록 한다.
 */
export function NameInputScreen({ onSubmit }: { onSubmit: (user: KioskUser) => void }) {
  const [name, setName] = useState('')
  const trimmed = name.trim()

  const submit = () => {
    if (!trimmed) return
    onSubmit({ name: trimmed })
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-12 text-center">
      <header>
        <h2 className="text-6xl font-extrabold tracking-tight text-foreground">
          성함을 입력해 주세요
        </h2>
        <p className="mt-4 text-3xl font-medium text-muted-foreground">
          화면을 누르면 키보드가 나타나요
        </p>
      </header>

      <div className="flex w-full max-w-[36rem] items-center gap-4 rounded-3xl border border-border bg-white/70 px-8 py-6 shadow-sm backdrop-blur-sm">
        <UserRound className="size-9 shrink-0 text-primary" strokeWidth={1.8} />
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="이름"
          className="w-full bg-transparent text-4xl font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
        />
      </div>

      <button
        onClick={submit}
        disabled={!trimmed}
        className="flex items-center justify-center gap-4 rounded-full bg-primary px-16 py-7 text-4xl font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-transform enabled:active:scale-95 disabled:opacity-30"
      >
        다음
        <ArrowRight className="size-9" />
      </button>
    </div>
  )
}
