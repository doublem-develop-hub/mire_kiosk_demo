import type { ReactNode } from 'react'

/**
 * 키오스크 프레임 - 화면 전체(어떤 화면비든)를 채우는 유동 레이아웃.
 * 예전엔 1080x1920 고정 캔버스를 그린 뒤 통째로 scale()했는데, 화면비가
 * 9:16과 다른 태블릿(예: 삼성 패드)에서 그 스케일을 억지로 늘리면(non-uniform
 * stretch) 원이 타원이 되는 등 좌우로 늘어져 보였다. 지금은 각 화면이 실제
 * 뷰포트를 그대로 채우고, 상대적인 크기(rem)만 index.css의 유동 폰트 크기로
 * 함께 조절되므로 어떤 비율에서도 왜곡 없이 꽉 찬다.
 */
export function KioskFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-dvh w-dvw flex-col overflow-hidden bg-gradient-to-b from-white to-[hsl(214_100%_97%)]">
      <div className="pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-[36rem] rounded-full bg-primary/10 blur-3xl" />

      <main className="relative flex h-full w-full flex-col px-16 py-16">
        {children}
      </main>
    </div>
  )
}
