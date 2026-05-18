# 🏗️ MiniProject - 프로젝트 구조

## 📋 프로젝트 개요

**MiniProject**는 NestJS 기반 백엔드와 Next.js 기반 프론트엔드로 구성된 풀스택 뉴스레터 플랫폼입니다.
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
│   │   ├── interviews/
│   │   ├── news/
│   │   ├── newsletter/
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

## 🔧 Backend (`techletter-backend`)

### 주요 구성

- **`src/main.ts`**: NestJS 애플리케이션 진입점
- **`src/app.module.ts`**: 루트 모듈, 하위 모듈 등록
- **`auth/`**: JWT 및 OAuth 인증
- **`categories/`**: 카테고리 관리
- **`chatbot/`**: 챗봇 서비스
- **`interactions/`**: 북마크, 좋아요, 댓글
- **`interviews/`**: 인터뷰 녹취 분석
- **`news/`**: 뉴스 CRUD 및 관련 로직
- **`newsletter/`**: 뉴스레터 발송 및 스케줄
- **`search/`**: 검색 기능
- **`stats/`**: 관리자 통계
- **`subscriptions/`**: 구독 관리
- **`tags/`**: 태그 관리
- **`upload/`**: 파일 업로드
- **`users/`**: 사용자 정보 및 권한
- **`database/`**: 마이그레이션 및 DB 관련
- **`test/`**: e2e 테스트
- **`uploads/`**: 업로드 파일 저장소

### 실행 스크립트

```bash
cd techletter-backend
npm install
npm run start:dev
```

---

## 🎨 Frontend (`techletter-frontend`)

### 주요 구성

- **`app/`**: Next.js App Router 기반 페이지
  - `layout.tsx` - 공통 레이아웃
  - `page.tsx` - 홈 페이지
  - `not-found.tsx` - 404 페이지
  - `(admin)/` - 관리자 페이지 영역
  - `(auth)/` - 인증 관련 페이지
  - `(main)/` - 일반 사용자 페이지
  - `api/` - 클라이언트용 API 엔드포인트
- **`components/`**: UI 재사용 컴포넌트
- **`hooks/`**: 커스텀 훅
- **`lib/`**: API 클라이언트 및 유틸 함수
- **`store/`**: 상태 관리
- **`styles/`**: 전역 스타일
- **`types/`**: 타입 정의
- **`public/`**: 정적 자산

### 실행 스크립트

```bash
cd techletter-frontend
npm install
npm run dev
```

---

## 📊 기술 스택

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript
- **데이터베이스**: PostgreSQL (추정)

---

## 🔄 데이터 흐름

1. 사용자 요청 → **Next.js frontend**
2. 프론트엔드에서 API 호출 → **NestJS backend**
3. 백엔드 처리 후 DB 조회/저장
4. 결과 반환 → **프론트엔드에서 렌더링**

---

## 🚀 시작 가이드

### 백엔드 실행
```bash
cd techletter-backend
npm install
npm run start:dev
```

### 프론트엔드 실행
```bash
cd techletter-frontend
npm install
npm run dev
```

---

## 📝 핵심 포인트

- `techletter-backend`는 뉴스/인증/구독/챗봇/검색 등 API 서버 역할
- `techletter-frontend`는 관리자 페이지, 사용자 페이지, 뉴스레터 작성/미리보기 UI를 포함
- 프로젝트는 풀스택 뉴스레터 플랫폼 구조로 분리되어 있음
