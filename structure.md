# Project Structure

이 프로젝트는 루트 아래에 프론트엔드와 백엔드가 분리되어 있는 구조입니다.

```text
minimi_pro/
├─ README.md
├─ .gitignore
├─ techletter-backend/
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ nest-cli.json
│  ├─ tsconfig.json
│  ├─ ormconfig.ts
│  └─ src/
│     ├─ main.ts
│     ├─ app.module.ts
│     ├─ auth/
│     ├─ users/
│     ├─ news/
│     ├─ categories/
│     ├─ tags/
│     ├─ interactions/
│     ├─ subscriptions/
│     ├─ newsletter/
│     ├─ notification/
│     ├─ push/
│     ├─ stats/
│     ├─ config/
│     └─ common/
└─ techletter-frontend/
   ├─ package.json
   ├─ package-lock.json
   ├─ next.config.js
   ├─ tailwind.config.ts
   ├─ tsconfig.json
   ├─ app/
   ├─ components/
   ├─ hooks/
   ├─ lib/
   ├─ store/
   ├─ styles/
   └─ types/
```

## Root

- `README.md`: 프로젝트 기본 설명 파일입니다.
- `.gitignore`: Git에서 제외할 파일 규칙입니다.
- `techletter-backend/`: NestJS 기반 백엔드 API 서버입니다.
- `techletter-frontend/`: Next.js 기반 프론트엔드 앱입니다.

## Backend

`techletter-backend`는 NestJS 10, TypeScript, TypeORM, PostgreSQL 기반으로 구성되어 있습니다.

주요 파일:

- `src/main.ts`: 백엔드 애플리케이션 실행 진입점입니다.
- `src/app.module.ts`: 전체 백엔드 모듈을 묶는 루트 모듈입니다.
- `ormconfig.ts`: TypeORM 설정 파일입니다.
- `package.json`: 백엔드 실행 스크립트와 의존성 정보가 있습니다.

주요 모듈:

- `auth/`: 로그인, 회원가입, JWT 인증, Google/Kakao OAuth 전략을 담당합니다.
- `users/`: 사용자 엔티티, 컨트롤러, 서비스가 있습니다.
- `news/`: 뉴스 작성, 수정, 조회 관련 API와 엔티티, DTO가 있습니다.
- `categories/`: 뉴스 카테고리 관리 기능입니다.
- `tags/`: 태그 관리 기능입니다.
- `interactions/`: 좋아요, 북마크, 댓글 기능입니다.
- `subscriptions/`: 구독자 관리 기능입니다.
- `newsletter/`: 뉴스레터 발송, 발송 기록, 스케줄러 관련 기능입니다.
- `notification/`: 이메일, 카카오 등 알림 발송 제공자를 관리합니다.
- `push/`: 푸시 알림 구독과 발송 관련 기능입니다.
- `stats/`: 관리자 통계 API입니다.
- `config/`: 데이터베이스 설정 등 환경 설정 코드가 있습니다.
- `common/`: 공통 데코레이터, 필터, 인터셉터가 있습니다.

백엔드 실행 스크립트:

```bash
npm run start:dev
npm run build
npm run test
```

## Frontend

`techletter-frontend`는 Next.js 14, React 18, TypeScript, Tailwind CSS 기반으로 구성되어 있습니다.

주요 파일:

- `app/layout.tsx`: Next.js App Router의 루트 레이아웃입니다.
- `app/globals.css`: 전역 CSS입니다.
- `app/not-found.tsx`: 404 페이지입니다.
- `app/api/auth/[...nextauth]/route.ts`: NextAuth 인증 API 라우트입니다.
- `package.json`: 프론트엔드 실행 스크립트와 의존성 정보가 있습니다.

주요 폴더:

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
