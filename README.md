# Minime TechLetter

NestJS 백엔드와 Next.js 프론트엔드로 만든 뉴스레터·기자 플랫폼 포트폴리오입니다.

## 구성

- `techletter-backend`: 인증, 뉴스, 카테고리, 태그, 구독, 통계, 챗봇 API
- `techletter-frontend`: 일반 사용자, 기자, 관리자 화면
- 포트폴리오 데모: 회원가입 없이 역할별 화면 열람 가능
- 데모 보호: 등록, 수정, 삭제 요청 차단 및 개인정보 마스킹

## 로컬 실행

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

프론트엔드 환경 변수:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

백엔드 환경 변수는 `techletter-backend/.env.example`을 참고하세요.

## 배포

- 무료 배포: [`DEPLOYMENT_FREE.md`](./DEPLOYMENT_FREE.md)
- AWS 배포: [`DEPLOYMENT_AWS.md`](./DEPLOYMENT_AWS.md)
