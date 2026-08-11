# Mire Kiosk Demo

Mire 키오스크 데모 (기본 프로젝트).

## 기술 스택

| 영역          | 기술                                   |
| ------------- | -------------------------------------- |
| 빌드/개발서버 | Vite + React 19 + TypeScript           |
| 스타일링      | Tailwind CSS v4                        |
| UI 컴포넌트   | shadcn/ui 방식 (CVA + tailwind-merge)  |
| 라우팅        | React Router v7                        |
| 서버 상태     | TanStack Query                         |
| 전역 상태     | Zustand                                |
| 코드 품질     | oxlint + Prettier                      |

> `mire_admin`과 동일한 스택으로 구성된 기본 프로젝트입니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 + 타입체크
npm run preview  # 빌드 결과 미리보기
npm run lint     # oxlint
npm run format   # Prettier 포맷팅
```

## 폴더 구조

```
src/
├─ lib/           # utils(cn) 등 헬퍼
├─ App.tsx        # 프로바이더 (QueryClient) + 기본 화면
├─ index.css      # Tailwind + 테마 토큰
└─ main.tsx       # 엔트리
```

## 다음 작업 제안

- `src/router.tsx` 추가 후 React Router로 화면 구성
- 키오스크 UI 컴포넌트 (`src/components/ui`) 작성
- Zustand 스토어 및 `src/lib/api.ts` 연결
