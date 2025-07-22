# 이미지 서버 (Image Server)

Node.js와 Express.js를 사용한 간단하고 강력한 이미지 업로드 서버입니다.

## ✨ 주요 기능

- � **보안 인증**: 세션 기반 웹 인터페이스 + API 키 기반 외부 API
- �📁 **폴더 관리**: 폴더 생성 및 폴더별 이미지 구성
- 🖼️ **이미지 업로드**: 다중 파일 업로드 지원
- 🗑️ **파일 관리**: 이미지 삭제 및 이름 변경
- 📋 **URL 복사**: 원클릭 이미지 URL 복사
- 🔄 **실시간 업데이트**: 즉시 반영되는 이미지 목록
- 📱 **반응형 UI**: 모바일 친화적 인터페이스
- 🔌 **외부 API**: 신뢰할 수 있는 시스템을 위한 RESTful API

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone <repository-url>
cd image-server
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 설정
`.env` 파일을 생성하거나 기본값을 사용하세요:

```env
# 서버 설정
PORT=31533
HOST=localhost
NODE_ENV=development

# 파일 업로드 설정
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
MAX_FILES_PER_UPLOAD=10

# 지원되는 이미지 형식
ALLOWED_IMAGE_EXTENSIONS=.jpg,.jpeg,.png,.gif,.webp,.bmp
ALLOWED_MIME_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp

# 보안 설정
ACCESS_PASSWORD=your_web_password
SESSION_SECRET=your_session_secret_key
API_KEY=your_api_key_for_external_systems
ENABLE_CORS=true
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### 4. 서버 실행
```bash
npm start
# 또는
node server.js
```

서버가 시작되면 `http://localhost:31533`에서 확인할 수 있습니다.

## 📋 환경 변수 설정

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `PORT` | `31533` | 서버 포트 번호 |
| `HOST` | `localhost` | 서버 호스트 |
| `NODE_ENV` | `development` | 개발/운영 환경 설정 |
| `UPLOAD_DIR` | `uploads` | 파일 업로드 디렉토리 |
| `MAX_FILE_SIZE` | `10485760` | 최대 파일 크기 (바이트) |
| `MAX_FILES_PER_UPLOAD` | `10` | 한 번에 업로드 가능한 최대 파일 수 |
| `ALLOWED_IMAGE_EXTENSIONS` | `.jpg,.jpeg,.png,.gif,.webp,.bmp` | 허용되는 파일 확장자 |
| `ALLOWED_MIME_TYPES` | `image/jpeg,image/jpg,image/png,...` | 허용되는 MIME 타입 |
| `ENABLE_CORS` | `true` | CORS 활성화 여부 |
| `CORS_ORIGINS` | `*` | 허용할 Origin 도메인 목록 |
| `ACCESS_PASSWORD` | - | 웹 인터페이스 접근용 비밀번호 |
| `SESSION_SECRET` | - | 세션 암호화용 비밀 키 |
| `API_KEY` | - | 외부 시스템용 API 키 |

## 🔐 인증 시스템

### 웹 인터페이스 접근
- `http://localhost:31533`에 접속하면 로그인 페이지가 표시됩니다
- `.env` 파일의 `ACCESS_PASSWORD`로 설정한 비밀번호를 입력하세요
- 로그인 후 24시간 동안 세션이 유지됩니다

### 외부 API 접근
외부 시스템에서 API를 사용할 때는 API 키가 필요합니다:

```bash
# 헤더로 API 키 전달 (권장)
curl -H "x-api-key: YOUR_API_KEY" "http://localhost:31533/api/status"

# 쿼리 파라미터로 API 키 전달
curl "http://localhost:31533/api/status?api_key=YOUR_API_KEY"
```

## 🛠️ API 엔드포인트

### 🌐 웹 인터페이스용 API (세션 인증 필요)

#### 파일 업로드
```http
POST /upload
Content-Type: multipart/form-data

{
  "image": File,
  "folder": "optional-folder-name"
}
```

#### 폴더 관리
```http
POST /create-folder
Content-Type: application/json

{
  "folderName": "folder-name"
}
```

```http
GET /folders
```

#### 이미지 목록 조회
```http
GET /images-list
GET /images-list/:folder
```

#### 파일 삭제
```http
DELETE /images/:filename
DELETE /images/:folder/:filename
```

#### 파일 이름 변경
```http
PUT /images/:filename/rename
PUT /images/:folder/:filename/rename
Content-Type: application/json

{
  "newName": "new-filename.jpg"
}
```

### 🔌 외부 시스템용 API (API 키 인증 필요)

#### API 사용법 가이드
```bash
curl http://localhost:31533/api
```

#### 단일 이미지 업로드
```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -F "image=@/path/to/image.jpg" \
  -F "folder=my-project" \
  http://localhost:31533/api/upload-single
```

**응답 예시:**
```json
{
  "success": true,
  "message": "파일 업로드 성공",
  "data": {
    "filename": "image_123456789.jpg",
    "originalName": "image.jpg",
    "url": "http://localhost:31533/images/my-project/image_123456789.jpg",
    "size": 245760,
    "folder": "my-project"
  }
}
```

#### 다중 이미지 업로드
```bash
curl -X POST \
  -H "x-api-key: YOUR_API_KEY" \
  -F "image=@image1.jpg" \
  -F "image=@image2.png" \
  -F "folder=my-gallery" \
  http://localhost:31533/api/upload
```

#### 이미지 목록 조회
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "http://localhost:31533/api/images?folder=my-project"
```

**응답 예시:**
```json
{
  "success": true,
  "message": "2개의 이미지를 찾았습니다.",
  "data": {
    "files": [
      {
        "filename": "image1.jpg",
        "url": "http://localhost:31533/images/my-project/image1.jpg",
        "size": 245760,
        "uploadDate": "2025-07-22T10:30:00.000Z",
        "folder": "my-project"
      }
    ],
    "count": 2,
    "folder": "my-project"
  }
}
```

#### 이미지 삭제
```bash
curl -X DELETE \
  -H "x-api-key: YOUR_API_KEY" \
  http://localhost:31533/api/images/my-project/image.jpg
```

#### API 상태 확인
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  http://localhost:31533/api/status
```

### 📝 API 응답 형식

모든 외부 API는 다음과 같은 일관된 형식으로 응답합니다:

```json
{
  "success": true/false,
  "message": "설명 메시지",
  "data": {
    // 실제 데이터
  },
  "errors": [
    // 에러 목록 (있는 경우)
  ]
}
```

## 📁 프로젝트 구조

```
image-server/
├── server.js          # 메인 서버 파일
├── package.json        # 프로젝트 설정
├── .env               # 환경 변수 (생성 필요)
├── .gitignore         # Git 무시 파일
├── README.md          # 프로젝트 문서
├── CHANGELOG.md       # 변경 이력
└── uploads/           # 업로드된 파일 저장소
    ├── api-uploads/   # 외부 API로 업로드된 파일
    └── [folders...]   # 사용자 생성 폴더들
```

## 🔧 개발

### 개발 모드로 실행
```bash
NODE_ENV=development node server.js
```

### 운영 모드로 실행
```bash
NODE_ENV=production node server.js
```

## 📦 의존성

- **express**: 웹 프레임워크
- **multer**: 파일 업로드 처리
- **cors**: CORS 지원
- **dotenv**: 환경 변수 관리
- **express-session**: 세션 관리
- **iconv-lite**: 한글 파일명 처리

## 🔒 보안 고려사항

### ✅ 구현된 보안 기능
- 세션 기반 웹 인터페이스 인증
- API 키 기반 외부 시스템 인증
- 파일 타입 및 크기 제한
- CORS 설정
- 한글 파일명 안전 처리

### ⚠️ 추가 보안 권장사항 (운영 환경)
- HTTPS 사용 필수
- Rate Limiting 적용
- 더 강력한 API 키 관리 시스템
- 파일 스캔 (바이러스/악성코드)
- 로그 모니터링

## 🐛 문제 해결

### 포트가 이미 사용 중인 경우
```bash
# 다른 포트 사용
PORT=3000 node server.js
```

### 업로드 디렉토리 권한 문제
```bash
# 업로드 디렉토리 권한 확인
chmod 755 uploads/
```

### CORS 오류
`.env` 파일에서 `CORS_ORIGINS`를 클라이언트 도메인으로 설정하세요.

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork 프로젝트
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 열기

## 📞 지원

문제가 있거나 기능 요청이 있다면 Issue를 생성해 주세요.

---

**즐거운 개발하세요!** 🎉
