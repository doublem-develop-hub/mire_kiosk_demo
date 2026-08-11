import { BrainCircuit, ScanEye, HeartPulse, Thermometer, Droplet } from 'lucide-react'

const ORBIT = [ScanEye, HeartPulse, Thermometer, Droplet]

/** AI가 수집된 센서 데이터로 스트레스 위험도를 분석하는 화면 */
export function AnalyzingScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-12 text-center">
      <div className="relative flex size-64 items-center justify-center">
        <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-primary/30" />
        <span className="absolute inline-flex size-full animate-spin rounded-full border-4 border-dashed border-primary/25 [animation-duration:8s]" />
        <div className="flex size-44 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40">
          <BrainCircuit className="size-20" strokeWidth={1.5} />
        </div>
      </div>

      <div>
        <h2 className="animate-fade-up text-6xl font-extrabold tracking-tight text-foreground">
          AI 분석 중
        </h2>
        <p className="animate-fade-up mt-5 text-3xl font-medium text-muted-foreground">
          수집된 센서 데이터로 스트레스 위험도를
          <br />
          분석하고 있습니다…
        </p>
      </div>

      <div className="flex items-center gap-7">
        {ORBIT.map((Icon, i) => (
          <Icon
            key={i}
            className="size-10 text-primary/50"
            style={{ animation: `kiosk-float 1.6s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}
