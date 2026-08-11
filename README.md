# mire_kiosk_demo

사내 홍채/생체신호(vitals) 출근·점심·퇴근 체크 키오스크의 화면(프론트엔드).
백엔드는 별도 저장소 [`doublem-develop-hub/mire_program_demo`](https://github.com/doublem-develop-hub/mire_program_demo)의
`kiosk_server.py`(FastAPI)이며, 노트북에 물린 홍채 스캐너/생체 센서를
실제로 제어한다. 이 프로젝트는 그 서버가 내려주는 `/api/roster`와
`/ws/visits/{id}` WebSocket으로 명단을 받고 측정 진행 상황을 실시간으로
받아 화면에 반영한다 — 하드웨어 관련 로직은 전혀 없다.

## 기술 스택

| 영역          | 기술                                   |
| ------------- | -------------------------------------- |
| 빌드/개발서버 | Vite + React 19 + TypeScript           |
| 스타일링      | Tailwind CSS v4 (반응형 - 화면비 무관, index.css의 유동 폰트 스케일 참고) |
| 라우팅        | 없음 (단일 화면, `App.tsx`의 상태 머신으로 단계 전환) |
| 서버 상태     | TanStack Query (`/api/roster`)         |
| 코드 품질     | oxlint + Prettier                      |

## 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173) - kiosk_server.py 없이도
                 # 화면 레이아웃만 볼 수 있지만, /api/roster가 없어 명단 화면
                 # 이후는 진행되지 않음
npm run build    # 프로덕션 빌드 + 타입체크 -> dist/
npm run preview  # 빌드 결과 미리보기
```

실제 동작(명단 로딩, 촬영, 측정)을 보려면 `mire_program_demo/kiosk_server.py`를
띄운 뒤 그 서버가 서빙하는 주소로 접속해야 한다 - 이 프로젝트만 단독으로는
백엔드 API가 없다.

## 배포 (kiosk_server.py에 반영하기)

```bash
npm run build
# dist/ 안의 내용을 mire_program_demo/kiosk_dist/ 로 통째로 복사
```

## 폴더 구조

```
src/
├─ App.tsx              # 상태 머신 - idle→select→scanned→stress→measuring→
│                          analyzing→done, WebSocket 이벤트 처리
├─ components/
│  └─ KioskFrame.tsx    # 화면 전체를 채우는 프레임 (반응형)
├─ screens/             # 단계별 화면 컴포넌트
│  ├─ IdleScreen, UserSelectScreen, ScannedScreen, StressScreen
│  ├─ MeasuringScreen, VitalsScanningOverlay, AnalyzingScreen
│  ├─ DoneScreen, ErrorScreen
├─ kiosk/
│  ├─ steps.ts          # 측정 항목 메타(아이콘/라벨/단위)
│  ├─ checkType.ts      # 출근/점심/퇴근 시간대 판단 (서버와 동일 로직이어야 함)
│  └─ errors.ts         # 오류 화면 정의 (코드별 문구/색)
└─ lib/
   ├─ api.ts            # 백엔드 REST/WebSocket 클라이언트
   └─ utils.ts          # cn() 등 헬퍼
```

## 참고

- `?error=<key>` 쿼리로 특정 오류 화면만 단독 렌더할 수 있다 (스크린샷용,
  `App.tsx`의 `ErrorPreview` 참고). 예: `/?error=iris-failed`
- `VitalsScanningOverlay`의 측정 중 수치는 순수 시각 효과(임의 값)이며, 결과가
  도착하는 즉시 실제 값으로 이어진다 - 실제 측정 중에는 부분 수치가 오지
  않기 때문 (Teensy 센서는 측정 종료 시점에만 최종값을 준다).
