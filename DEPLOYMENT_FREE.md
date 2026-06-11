# 무료 배포 가이드

이 프로젝트는 아래 조합으로 유료 서버 없이 공개할 수 있습니다.

- 프론트엔드: Vercel Hobby
- 백엔드: Render Free Web Service
- 데이터베이스: Neon Free PostgreSQL
- 소스 저장소: GitHub `Chaehayul/Minime`

무료 플랜의 정책은 바뀔 수 있습니다. Render 무료 서버는 사용하지 않을 때 정지되므로 첫 접속이 느릴 수 있습니다.

## 1. GitHub

현재 브랜치를 `Chaehayul/Minime`에 올립니다. `.env` 파일은 올리지 않고 각 서비스의 환경 변수 화면에 직접 입력합니다.

## 2. Neon 데이터베이스

1. Neon에서 무료 프로젝트를 생성합니다.
2. 대시보드의 PostgreSQL 연결 문자열을 복사합니다.
3. Render의 `DATABASE_URL`에 연결 문자열을 입력합니다.
4. 최초 배포는 `DB_SYNCHRONIZE=true`로 테이블을 생성합니다.

새 DB에는 로컬 MySQL 데이터가 자동으로 복사되지 않습니다. 포트폴리오 공개 전에 실제 기사, 카테고리, 태그와 데모 계정을 이 DB로 이전해야 합니다. 임시 목업 데이터는 사용하지 않습니다.

## 3. Render 백엔드

1. Render에서 **New > Blueprint**를 선택합니다.
2. GitHub의 `Chaehayul/Minime` 저장소를 연결합니다.
3. 저장소 루트의 `render.yaml`을 사용해 `minime-api`를 생성합니다.
4. 아래 값을 입력합니다.

```env
DATABASE_URL=Neon 연결 문자열
FRONTEND_URL=https://Vercel에서-발급된-주소
CORS_ORIGINS=https://Vercel에서-발급된-주소
PUBLIC_BASE_URL=https://Render에서-발급된-주소
```

필요할 때만 `OPENAI_API_KEY`, 뉴스 API 키, OAuth 키를 추가합니다. 비밀 키는 GitHub에 커밋하지 않습니다.

배포 후 `https://Render주소/`에서 다음 응답이 나오면 정상입니다.

```json
{"status":"ok","service":"techletter-api"}
```

## 4. Vercel 프론트엔드

1. Vercel에서 GitHub 저장소를 Import합니다.
2. **Root Directory**를 `techletter-frontend`로 지정합니다.
3. Framework Preset은 Next.js를 사용합니다.
4. 환경 변수를 추가합니다.

```env
NEXT_PUBLIC_API_BASE_URL=https://Render에서-발급된-주소
```

배포 후 발급된 Vercel 주소를 Render의 `FRONTEND_URL`, `CORS_ORIGINS`에 다시 입력하고 백엔드를 재배포합니다.

## 5. 포트폴리오 공개 전 확인

- 데모 전환 메뉴에서 일반 사용자, 기자, 관리자 화면이 모두 열리는지 확인합니다.
- 데모 계정 ID가 실제 배포 DB의 계정 ID와 일치해야 합니다.
- 데모 토큰의 등록, 수정, 삭제 요청이 `DEMO_READ_ONLY`로 차단되는지 확인합니다.
- 이메일, 결제 식별자, 관리자 메모 같은 개인정보가 마스킹되는지 확인합니다.
- 화면에 개인 사진이나 무관한 이미지가 없는지 확인합니다.
- Render 무료 서버의 첫 요청은 대기 시간이 생길 수 있습니다.

## 이미지 저장소 주의

현재 포트폴리오에 필요한 기존 기사 이미지는 저장소의 `techletter-backend/uploads`에서 읽습니다. 데모 모드는 업로드가 차단되어 파일이 추가되지 않습니다.

향후 실제 운영 서비스로 바꿔 업로드 기능을 사용할 때는 Render의 임시 디스크 대신 Cloudinary, AWS S3 같은 외부 저장소를 연결해야 합니다.
