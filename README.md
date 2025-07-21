# 이미지 서버 (Image Server)

Node.js와 Express.js를 사용한 간단하고 강력한 이미지 업로드 서버입니다.

## ✨ 주요 기능

- 📁 **폴더 관리**: 폴더 생성 및 폴더별 이미지 구성
- 🖼️ **이미지 업로드**: 다중 파일 업로드 지원
- 🗑️ **파일 관리**: 이미지 삭제 및 이름 변경
- 📋 **URL 복사**: 원클릭 이미지 URL 복사
- 🔄 **실시간 업데이트**: 즉시 반영되는 이미지 목록
- 📱 **반응형 UI**: 모바일 친화적 인터페이스

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

## 🛠️ API 엔드포인트

### 파일 업로드
```http
POST /upload
Content-Type: multipart/form-data

{
  "image": File,
  "folder": "optional-folder-name"
}
```

### 폴더 관리
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

### 이미지 목록 조회
```http
GET /images-list
GET /images-list/:folder
```

### 파일 삭제
```http
DELETE /images/:filename
DELETE /images/:folder/:filename
```

### 파일 이름 변경
```http
PUT /images/:filename/rename
PUT /images/:folder/:filename/rename
Content-Type: application/json

{
  "newName": "new-filename.jpg"
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

## 🔒 보안 고려사항

⚠️ **주의**: 현재 버전은 개발/테스트 용도로 설계되었습니다. 운영 환경에서 사용하기 전에 다음 보안 조치를 고려하세요:

- 인증 및 권한 시스템 구현
- Rate Limiting 적용
- Path Traversal 공격 방지
- 파일 타입 검증 강화
- HTTPS 사용

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
