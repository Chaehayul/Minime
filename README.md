# MiniProject

MiniProject는 NestJS 기반 백엔드와 Next.js 기반 프론트엔드로 구성된 뉴스레터 플랫폼입니다.

## 프로젝트 구성

- **techletter-backend**: NestJS 서버, 인증, 뉴스/카테고리/태그/구독/통계/챗봇 등 기능을 담당
- **techletter-frontend**: Next.js 앱, 사용자 화면, 관리자 화면, 테마 및 알림 UI를 담당

## 핵심 기술 스택

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript

## 주요 폴더

- `techletter-backend/src`: NestJS 소스 코드
- `techletter-backend/test`: E2E 테스트
- `techletter-frontend/app`: Next.js App Router 페이지
- `techletter-frontend/components`: 재사용 가능한 UI 컴포넌트
- `techletter-frontend/hooks`: 커스텀 훅
- `techletter-frontend/lib`: API 클라이언트 및 유틸리티

## 실행 방법

각 디렉터리에서 다음 명령을 사용합니다.

```bash
cd techletter-backend
npm install
npm run start:dev
```

```bash
cd techletter-frontend
npm install
npm run dev
```

## 참고

더 자세한 프로젝트 구조는 `structure.md`에 정리되어 있습니다.