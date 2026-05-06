# 🏗️ MiniProject - 프로젝트 구조

## 📋 프로젝트 개요

**MiniProject**는 NestJS 백엔드와 Next.js 프론트엔드로 구성된 풀스택 뉴스레터 플랫폼입니다.
- **Backend**: NestJS + TypeScript + TypeORM + PostgreSQL
- **Frontend**: Next.js + React + TypeScript + Tailwind CSS

---

## 📁 전체 폴더 구조

```
MiniProject/
├── package.json                (루트 패키지 파일)
├── README.md                   (프로젝트 설명)
├── structure.md               (이 파일 - 구조 문서)
│
├── techletter-backend/        (🔧 NestJS 백엔드)
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── nest-cli.json
│   ├── eslint.config.mjs
│   ├── src/
│   │   ├── main.ts            (애플리케이션 진입점)
│   │   ├── app.module.ts      (루트 모듈)
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   │
│   │   ├── auth/              (🔐 인증 모듈)
│   │   ├── users/             (👥 사용자 모듈)
│   │   ├── news/              (📰 뉴스 모듈)
│   │   ├── categories/        (📂 카테고리 모듈)
│   │   ├── tags/              (🏷️ 태그 모듈)
│   │   ├── interactions/      (💬 상호작용 모듈)
│   │   │   ├── bookmarks.controller.ts
│   │   │   ├── comments.controller.ts
│   │   │   ├── likes.controller.ts
│   │   │   └── entities/
│   │   ├── subscriptions/     (📧 구독 모듈)
│   │   ├── stats/             (📊 통계 모듈)
│   │   ├── chatbot/           (🤖 챗봇 모듈)
│   │   ├── upload/            (📤 파일 업로드 모듈)
│   │   ├── types/             (타입 정의)
│   │   ├── database/          (🗄️ DB 마이그레이션)
│   │   └── config/            (⚙️ 설정 파일)
│   │
│   ├── test/                  (📝 테스트)
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   ├── uploads/               (📁 업로드된 파일 저장소)
│   └── README.md
│
└── techletter-frontend/       (🎨 Next.js 프론트엔드)
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── eslint.config.mjs
    ├── postcss.config.mjs
    ├── next-env.d.ts
    │
    ├── app/                   (📄 Next.js App Router)
    │   ├── layout.tsx         (루트 레이아웃)
    │   ├── page.tsx           (홈페이지)
    │   ├── not-found.tsx      (404 페이지)
    │   ├── globals.css
    │   ├── (admin)/           (관리자 라우트)
    │   ├── (auth)/            (인증 라우트)
    │   ├── (main)/            (메인 라우트)
    │   └── api/               (API 라우트)
    │
    ├── components/            (♻️ 재사용 컴포넌트)
    │   ├── ThemeProvider.tsx
    │   ├── admin/             (관리자 컴포넌트)
    │   ├── common/            (공통 컴포넌트)
    │   ├── editor/            (에디터 컴포넌트)
    │   ├── interaction/       (상호작용 컴포넌트)
    │   ├── layout/            (레이아웃 컴포넌트)
    │   └── news/              (뉴스 컴포넌트)
    │
    ├── hooks/                 (🎣 커스텀 훅)
    │   ├── useAuth.ts
    │   ├── useBookmark.ts
    │   ├── useDarkMode.ts
    │   ├── useLike.ts
    │   └── usePushNotification.ts
    │
    ├── lib/                   (🛠️ 유틸리티)
    │   ├── api.ts             (API 클라이언트)
    │   ├── auth.ts            (인증 관련)
    │   └── utils.ts           (일반 유틸리티)
    │
    ├── store/                 (🗂️ 상태 관리)
    │   ├── authStore.ts       (인증 상태)
    │   └── uiStore.ts         (UI 상태)
    │
    ├── types/                 (📝 타입 정의)
    │   ├── api.ts
    │   ├── news.ts
    │   └── user.ts
    │
    ├── styles/                (🎨 스타일)
    │   └── theme.css
    │
    ├── public/                (📦 정적 파일)
    ├── AGENTS.md
    ├── CLAUDE.md
    └── README.md
```

---

## 🔧 Backend (techletter-backend)

### 핵심 모듈

| 모듈 | 설명 |
|------|------|
| **auth** | JWT, Google OAuth, Kakao OAuth 인증 처리 |
| **users** | 사용자 정보 관리 |
| **news** | 뉴스 CRUD, 스케줄러 |
| **categories** | 뉴스 카테고리 관리 |
| **tags** | 태그 관리 및 연결 |
| **interactions** | 좋아요, 북마크, 댓글 기능 |
| **subscriptions** | 뉴스레터 구독 관리 |
| **stats** | 관리자 통계 API |
| **chatbot** | 챗봇 기능 (테스트 포함) |
| **upload** | 파일 업로드 처리 |

### 주요 파일
- `src/main.ts` - 애플리케이션 시작점
- `src/app.module.ts` - 모듈 통합
- `nest-cli.json` - NestJS CLI 설정
- `tsconfig.json` - TypeScript 설정

### 실행 스크립트
```bash
npm run start:dev      # 개발 모드
npm run build         # 프로덕션 빌드
npm run test          # 단위 테스트
npm run test:e2e      # E2E 테스트
```

---

## 🎨 Frontend (techletter-frontend)

### 라우트 구조
- `(admin)` - 관리자 페이지
- `(auth)` - 로그인/회원가입 페이지
- `(main)` - 메인 뉴스레터 페이지
- `api/` - API 라우트

### 주요 폴더

| 폴더 | 설명 |
|------|------|
| **components** | 재사용 가능한 UI 컴포넌트 |
| **hooks** | 인증, 북마크, 테마, 알림 등 커스텀 훅 |
| **lib** | API 클라이언트, 인증 로직, 유틸리티 |
| **store** | Zustand 상태 관리 (인증, UI) |
| **types** | TypeScript 타입 정의 |
| **styles** | 테마 및 전역 스타일 |
| **public** | 정적 자산 (이미지, 폰트 등) |

### 실행 스크립트
```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run start        # 빌드된 앱 시작
npm run lint         # ESLint 실행
```

---

## 🔄 데이터 흐름

```
User (Frontend)
    ↓
Next.js App (Components, Hooks, Store)
    ↓
API Client (lib/api.ts)
    ↓
NestJS Backend (Controllers, Services)
    ↓
TypeORM (Database)
    ↓
PostgreSQL
```

---

## 📊 기술 스택 요약

| 계층 | 기술 |
|------|------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand |
| **Backend** | NestJS 10, TypeScript, TypeORM, PostgreSQL |
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
