/** kiosk_server.py(FastAPI)와 통신하는 얇은 클라이언트. 같은 오리진에서 서빙되므로 상대 경로만 쓴다. */

export interface StressLevel {
  label: string
  score: number
}

export interface RosterResponse {
  checkTypes: string[]
  roster: { dept: string; names: string[] }[]
  stressLevels: StressLevel[]
  vitalsAvailable: boolean
}

export async function fetchRoster(): Promise<RosterResponse> {
  const res = await fetch('/api/roster')
  if (!res.ok) throw new Error(`명단을 불러오지 못했습니다 (${res.status})`)
  return res.json()
}

export interface StartVisitPayload {
  name: string
  dept: string
  checkType: string
  stressLabel: string
  stressScore: number
}

export async function startVisit(
  payload: StartVisitPayload
): Promise<{ visitId: string }> {
  const res = await fetch('/api/visits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`측정을 시작하지 못했습니다 (${res.status})`)
  return res.json()
}

export async function retryVisit(visitId: string): Promise<void> {
  const res = await fetch(`/api/visits/${visitId}/retry`, { method: 'POST' })
  if (!res.ok) throw new Error(`재시도에 실패했습니다 (${res.status})`)
}

export async function cancelVisit(visitId: string): Promise<void> {
  await fetch(`/api/visits/${visitId}/cancel`, { method: 'POST' })
}

export type VisitEvent =
  | { type: 'capture_started' }
  | { type: 'capture_error'; message: string }
  | {
      type: 'capture_done'
      eyesCaptured: number
      flags: { side: string; issue: string }[]
    }
  | { type: 'sensor_wait'; username: string; message?: string }
  | { type: 'sensor_measuring' }
  | { type: 'sensor_countdown'; remainingSec: number }
  | { type: 'sensor_timeout' }
  | { type: 'error'; code: string; message?: string }
  | {
      type: 'done'
      vitals: {
        temp_c: number | null
        heart_rate_bpm: number | null
        spo2_pct: number | null
      }
    }

/** 방문 이벤트 스트림 — 서버가 done/error를 보내면 소켓을 닫는다. 다시 시도 시 새 소켓을 열면 된다. */
export function openVisitSocket(
  visitId: string,
  onEvent: (event: VisitEvent) => void
): WebSocket {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const ws = new WebSocket(`${proto}://${window.location.host}/ws/visits/${visitId}`)
  ws.onmessage = (e) => {
    onEvent(JSON.parse(e.data) as VisitEvent)
  }
  return ws
}
