# MiniProject — 프로젝트 구조 요약

간단한 한눈 요약

- Backend: NestJS + TypeScript 기반 API 서버(`techletter-backend`)
- Frontend: Next.js(App Router) + React + TypeScript + Tailwind(`techletter-frontend`)

목적: 뉴스/뉴스레터 플랫폼 — 사용자 인증, 구독, 뉴스 CRUD, 통계, 챗봇, 기자 관리 등 기능 포함

---

## 최상위 파일/폴더

- `package.json`, `README.md`, `structure.md`
- `techletter-backend/` — NestJS 프로젝트
- `techletter-frontend/` — Next.js 프로젝트

---

## 📁 전체 폴더 구조 (자세히)

```
MiniProject/
├── package.json
├── README.md
├── structure.md
├── techletter-backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── nest-cli.json
│   ├── eslint.config.mjs
│   ├── README.md
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── oauth-strategies/
│   │   ├── categories/
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.service.ts
│   │   │   └── category.entity.ts
│   │   ├── chatbot/
│   │   ├── database/
│   │   │   └── migrations/
│   │   ├── interactions/
│   │   │   ├── bookmarks.controller.ts
│   │   │   ├── bookmarks.service.ts
│   │   │   ├── comments.controller.ts
│   │   │   ├── comments.service.ts
│   │   │   ├── likes.controller.ts
│   │   │   ├── likes.service.ts
│   │   │   ├── interactions.module.ts
│   │   │   └── entities/
│   │   ├── interviews/
│   │   ├── news/
│   │   │   ├── news.controller.ts
│   │   │   ├── news.service.ts
│   │   │   └── news.entity.ts
│   │   ├── newsletter/
│   │   ├── reporters/
│   │   ├── search/
│   │   ├── stats/
│   │   ├── subscriptions/
│   │   ├── tags/
│   │   ├── types/
│   │   ├── upload/
│   │   └── users/
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   └── uploads/
└── techletter-frontend/
	├── package.json
	├── tsconfig.json
	├── next.config.ts
	├── eslint.config.mjs
	├── postcss.config.mjs
	├── next-env.d.ts
	├── README.md
	├── AGENTS.md
	├── CLAUDE.md
	├── app/
	│   ├── globals.css
	│   ├── layout.tsx
	│   ├── page.tsx
	│   ├── not-found.tsx
	│   ├── (admin)/
	│   ├── (auth)/
	│   ├── (main)/
	│   │   └── mypage/
	│   └── api/
	├── components/
	│   ├── ThemeProvider.tsx
	│   ├── admin/
	│   ├── common/
	│   ├── editor/
	│   ├── interaction/
	│   ├── layout/
	│   └── news/
	├── hooks/
	│   ├── useAuth.ts
	│   ├── useBookmark.ts
	│   ├── useDarkMode.ts
	│   ├── useLike.ts
	│   ├── usePushNotification.ts
	│   └── useUserReport.ts
	├── lib/
	│   ├── api.ts
	│   ├── auth.ts
	│   └── utils.ts
	├── store/
	│   ├── authStore.ts
	│   └── uiStore.ts
	├── styles/
	│   └── theme.css
	├── types/
	│   ├── api.ts
	│   ├── news.ts
	│   └── user.ts
	└── public/
```

---

## techletter-backend (요약)

- 진입점: `src/main.ts`
- 주요 모듈: `auth/`, `users/`, `news/`, `newsletter/`, `subscriptions/`, `interactions/`(bookmarks/likes/comments), `chatbot/`, `search/`, `stats/`, `upload/`, `database/`(migrations)
- 테스트: `test/` (e2e 설정)
- 실행 예:

```bash
cd techletter-backend
npm install
npm run start:dev
```

### 주요 파일 및 역할

- `src/main.ts` — 애플리케이션 진입점 (NestJS 서버 부트스트랩)
- `src/app.module.ts` — 루트 모듈, 하위 모듈 등록
- `src/auth/` — JWT / OAuth 전략 및 가드 (google/kakao/naver 등)
- `src/users/` — 사용자 CRUD 및 권한 로직
- `src/news/` — 뉴스 작성/수정/삭제, 썸네일 처리
- `src/subscriptions/` — 구독 상태 관리 API
- `src/interactions/` — 북마크/좋아요/댓글 컨트롤러
- `src/chatbot/` — 챗봇/AI 연동 서비스
- `src/database/migrations/` — DB 마이그레이션
- `test/jest-e2e.json` & `test/*.spec.ts` — e2e 테스트 설정

### package.json 주요 스크립트

- `npm run start:dev` — 개발 모드 (watch)
- `npm run build` — 빌드 (NestJS `nest build`)
- `npm run start:prod` — 프로덕션 실행 `node dist/main`
- `npm run lint` — ESLint (자동 수정 포함)
- `npm run test` / `test:e2e` — 유닛/통합 테스트

---

---

## techletter-frontend (요약)

- App Router 기반: `app/` (루트 레이아웃, 페이지, 라우트 그룹 `(admin)`, `(auth)`, `(main)` 등)
- 재사용 컴포넌트: `components/`
- 클라이언트 API 및 유틸: `lib/` (`api.ts` 등)
- 훅: `hooks/` (인증, 북마크, 다크모드 등)
- 전역 타입: `types/`
- 정적 자산: `public/`
- 실행 예:

```bash
cd techletter-frontend
npm install
npm run dev
```

---

## 개발/운영 포인트

- 인증: JWT 및 OAuth 전략이 `auth/`에 구현되어 있음
- 구독/결제: `subscriptions` 관련 API 및 프론트 UI 존재
- 관리자 기능: 관리자/기자용 라우트와 UI 컴포넌트 분리
- 이미지/파일: 업로드 및 정적 파일 폴더(`uploads`, `public`)

---

## 요약(한 줄)

NestJS 백엔드와 Next.js 프론트엔드를 분리한 풀스택 뉴스레터 플랫폼 저장소입니다. 프론트엔드는 App Router 기반 구조와 재사용 컴포넌트, 훅, 타입 정의를 갖추고 있고, 백엔드는 인증·구독·뉴스·통계 등 핵심 API를 제공합니다.

---