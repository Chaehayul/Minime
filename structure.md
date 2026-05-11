# 🏗️ MiniProject - 프로젝트 구조

## 📋 프로젝트 개요

**MiniProject**는 NestJS 백엔드와 Next.js 프론트엔드로 구성된 풀스택 뉴스레터 플랫폼입니다.
- **Backend**: NestJS + TypeScript
- **Frontend**: Next.js + React + TypeScript + Tailwind CSS

---

## 📁 전체 폴더 구조

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
│   │   ├── categories/
│   │   ├── chatbot/
│   │   ├── database/
│   │   ├── interactions/
│   │   │   ├── bookmarks.controller.ts
│   │   │   ├── comments.controller.ts
│   │   │   ├── likes.controller.ts
│   │   │   ├── interactions.module.ts
│   │   │   └── entities/
│   │   ├── news/
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
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── not-found.tsx
    │   ├── globals.css
    │   ├── (admin)/
    │   ├── (auth)/
    │   ├── (main)/
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
    │   └── usePushNotification.ts
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

## 🔧 Backend (techletter-backend)

### 주요 구성

- **`src/main.ts`**: NestJS 애플리케이션 진입점
- **`src/app.module.ts`**: 루트 모듈, 하위 모듈 등록
- **`auth/`**: 인증 관련 (JWT, OAuth 등)
- **`users/`**: 사용자 관리
- **`news/`**: 뉴스 CRUD 및 스케줄링
- **`categories/`**: 카테고리 관리
- **`tags/`**: 태그 관리
- **`interactions/`**: 북마크, 좋아요, 댓글
- **`subscriptions/`**: 구독 정보 및 결제
- **`stats/`**: 관리자 통계
- **`chatbot/`**: 챗봇 서비스
- **`upload/`**: 파일 업로드
- **`database/`**: 마이그레이션 및 DB 관련

### 실행 스크립트

```bash
npm run start:dev
npm run build
npm run test
npm run test:e2e
```

---

## 🎨 Frontend (techletter-frontend)

### 주요 구성

- **`app/`**: Next.js App Router
  - `layout.tsx`: 공통 레이아웃
  - `page.tsx`: 메인 페이지
  - `not-found.tsx`: 404 페이지
  - `(admin)/`: 관리자 전용 페이지
  - `(auth)/`: 인증 페이지
  - `(main)/`: 사용자용 메인 페이지
  - `api/`: 서버 API 엔드포인트
- **`components/`**: 재사용 UI 컴포넌트
- **`hooks/`**: 커스텀 훅
- **`lib/`**: API 클라이언트 및 유틸리티
- **`store/`**: 상태 관리
- **`types/`**: 타입 정의
- **`styles/`**: 전역 스타일 및 테마
- **`public/`**: 정적 자산

### 실행 스크립트

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

## 📊 기술 스택

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript
- **데이터베이스**: PostgreSQL (예상)

---

## 🔄 전체 흐름

1. 사용자 요청 → **Next.js frontend**
2. API 호출 → **NestJS backend**
3. 백엔드 비즈니스 로직 처리
4. 데이터베이스 저장/조회
5. 결과 반환 → **Frontend 렌더링**
| **인증** | JWT, Google OAuth 2.0, Kakao OAuth |
| **배포** | (설정 필요) |

---

## 🚀 시작하기

### 백엔드 설정
```bash
cd techletter-backend
npm install
npm run start:dev
```

### 프론트엔드 설정
```bash
cd techletter-frontend
npm install
npm run dev
```

---

## 📝 주요 폴더

- `app/(main)/`: 일반 사용자 화면 라우트입니다.
- `app/(auth)/`: 로그인, 회원가입 화면 라우트입니다.
- `app/(admin)/`: 관리자 화면 라우트입니다.
- `components/common/`: Header, Footer, Button, Modal, Pagination 등 공통 UI 컴포넌트입니다.
- `components/news/`: 뉴스 카드, 목록, 상세, 태그, 핫토픽 관련 컴포넌트입니다.
- `components/interaction/`: 좋아요, 북마크, 댓글, 공유 버튼 컴포넌트입니다.
- `components/admin/`: 관리자용 테이블과 차트 컴포넌트입니다.
- `components/editor/`: 뉴스 작성/수정용 에디터 컴포넌트입니다.
- `hooks/`: 인증, 다크모드, 좋아요, 북마크, 푸시 알림 관련 커스텀 훅입니다.
- `lib/`: API 클라이언트, 인증 유틸, 공통 유틸 함수입니다.
- `store/`: Zustand 기반 전역 상태 저장소입니다.
- `styles/`: 테마 CSS 파일입니다.
- `types/`: API, 뉴스, 사용자 타입 정의입니다.

프론트엔드 주요 라우트:

- `/`: 메인 페이지
- `/news`: 뉴스 목록
- `/news/[id]`: 뉴스 상세
- `/category/[slug]`: 카테고리별 뉴스
- `/tag/[slug]`: 태그별 뉴스
- `/search`: 검색
- `/archive`: 아카이브
- `/hot-topic`: 핫토픽
- `/mypage`: 마이페이지
- `/mypage/bookmarks`: 북마크
- `/mypage/settings`: 설정
- `/login`: 로그인
- `/signup`: 회원가입
- `/admin`: 관리자 대시보드
- `/admin/news`: 관리자 뉴스 관리
- `/admin/news/create`: 뉴스 작성
- `/admin/news/[id]/edit`: 뉴스 수정
- `/admin/subscribers`: 구독자 관리
- `/admin/sends`: 발송 내역
- `/admin/stats`: 통계

프론트엔드 실행 스크립트:

```bash
npm run dev
npm run build
npm run lint
```

## Data Flow Overview

1. 사용자는 `techletter-frontend`의 Next.js 화면에서 뉴스, 검색, 로그인, 마이페이지, 관리자 기능을 사용합니다.
2. 프론트엔드는 `lib/api.ts` 등을 통해 백엔드 API와 통신합니다.
3. `techletter-backend`는 NestJS 컨트롤러와 서비스를 통해 요청을 처리합니다.
4. 데이터는 TypeORM 엔티티를 통해 PostgreSQL에 저장됩니다.
5. 뉴스레터, 푸시, 이메일/카카오 알림 같은 비동기성 기능은 백엔드의 전용 모듈에서 처리됩니다.
