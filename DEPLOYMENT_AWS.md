# AWS Deployment Guide

TechLetter는 Next.js 프론트엔드와 NestJS 백엔드를 분리해서 배포하는 구성이 가장 단순합니다.

## 권장 아키텍처

- Frontend: AWS Amplify Hosting 또는 S3 + CloudFront
- Backend: AWS Elastic Beanstalk, App Runner, ECS Fargate 중 하나
- Database: Amazon RDS MySQL
- Uploads: 현재 코드는 서버 로컬 `uploads/`를 사용합니다. 운영에서는 재배포/스케일아웃 때 파일이 사라질 수 있으므로 S3 업로드로 바꾸는 것을 권장합니다.
- Domain/HTTPS: Route 53 + ACM 인증서 + CloudFront 또는 ALB

## 1. RDS MySQL 생성

1. RDS에서 MySQL 인스턴스를 생성합니다.
2. 보안 그룹에서 백엔드 실행 환경만 DB 포트에 접근하게 엽니다.
3. DB 엔드포인트, 포트, DB명, 사용자명, 비밀번호를 백엔드 환경변수에 넣습니다.

운영에서는 `DB_SYNCHRONIZE=false`로 둡니다. TypeORM `synchronize=true`는 실제 데이터베이스 스키마를 자동 변경할 수 있어서 운영 데이터에 위험합니다.

## 2. Backend 배포

Elastic Beanstalk 기준:

```bash
cd techletter-backend
npm ci
npm run build
npm run start:prod
```

환경변수:

```env
NODE_ENV=production
PORT=3000
PUBLIC_BASE_URL=https://api.example.com
FRONTEND_URL=https://example.com
CORS_ORIGINS=https://example.com

DB_HOST=your-rds-endpoint.ap-northeast-2.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=techletter
DB_SSL=true
DB_SYNCHRONIZE=false

PORTFOLIO_DEMO_ENABLED=true
DEMO_USER_USER_ID=1
DEMO_REPORTER_USER_ID=17
DEMO_ADMIN_USER_ID=3

JWT_SECRET=replace-with-long-random-secret
OPENAI_API_KEY=...
NAVER_SEARCH_CLIENT_ID=...
NAVER_SEARCH_CLIENT_SECRET=...
NEWS_API_KEY=...

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://api.example.com/auth/google/callback
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...
KAKAO_CALLBACK_URL=https://api.example.com/auth/kakao/callback
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
NAVER_CALLBACK_URL=https://api.example.com/auth/naver/callback
```

`PUBLIC_BASE_URL`은 업로드 파일 URL을 만들 때 사용됩니다. 백엔드 도메인과 같게 두면 됩니다.

## 3. Frontend 배포

Amplify Hosting 기준:

```bash
cd techletter-frontend
npm ci
npm run build
```

환경변수:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

OAuth 로그인 버튼, API 요청, 업로드 이미지 허용 도메인이 이 값으로 연결됩니다.

## 4. 도메인 연결

1. `api.example.com`은 백엔드 로드밸런서 또는 App Runner 서비스에 연결합니다.
2. `example.com`은 Amplify 또는 CloudFront에 연결합니다.
3. Google/Kakao/Naver 개발자 콘솔의 Callback URL도 운영 백엔드 주소로 변경합니다.

## 5. 배포 전 체크리스트

- `npm run build`가 프론트/백 모두 성공해야 합니다.
- `CORS_ORIGINS`에 프론트 운영 도메인이 들어가야 합니다.
- `NEXT_PUBLIC_API_BASE_URL`, `PUBLIC_BASE_URL`, OAuth callback URL에 `localhost`가 없어야 합니다.
- 운영 DB는 `DB_SYNCHRONIZE=false`로 시작합니다.
- 데모 사용자 ID는 배포 DB에 존재하는 일반 사용자, 승인 기자, 관리자 계정으로 지정합니다.
- 데모 토큰의 저장·수정·삭제 요청은 백엔드에서 일괄 차단됩니다.
- 관리자 계정과 초기 카테고리/태그 데이터는 실제 API 또는 DB seed로 준비합니다. 화면에서 임시 목업 데이터로 채우지 않습니다.
