# 변경 이력 (Changelog)

## [v2.0.0] - 2025-07-21

### 🆕 새로운 기능
- **폴더 관리 시스템**
  - 폴더 생성 기능 추가
  - 폴더별 이미지 업로드 지원
  - 폴더 선택 및 전환 기능

- **이미지 관리 기능**
  - 이미지 삭제 기능 추가
  - 이미지 이름 변경 기능 추가
  - 다중 파일 업로드 지원

- **향상된 UI/UX**
  - 반응형 그리드 레이아웃
  - 모달 창 인터페이스
  - 버튼 스타일링 개선 (일반/위험 구분)
  - 현재 폴더 표시

### 🔧 개선 사항
- 파일 업로드 시 고유한 파일명 생성
- 이미지 목록 날짜순 정렬
- 에러 처리 개선
- 콘솔 로그 추가 (디버깅용)

### 🏗️ API 변경사항
- `POST /create-folder` - 폴더 생성 API 추가
- `GET /folders` - 폴더 목록 조회 API 추가
- `GET /images-list` - 루트 폴더 이미지 목록 조회
- `GET /images-list/:folder` - 특정 폴더 이미지 목록 조회
- `DELETE /images/:filename` - 루트 폴더 이미지 삭제
- `DELETE /images/:folder/:filename` - 폴더 내 이미지 삭제
- `PUT /images/:filename/rename` - 루트 폴더 이미지 이름 변경
- `PUT /images/:folder/:filename/rename` - 폴더 내 이미지 이름 변경

### 🐛 버그 수정
- Express.js 라우트 패턴 오류 수정 (선택적 매개변수 문제 해결)
- JavaScript 템플릿 리터럴 문법 오류 수정
- 파일 업로드 시 폼 리셋 문제 해결

### 💻 기술적 개선
- 라우트 구조 개선 (명시적 경로 분리)
- DOM 요소 생성 방식 개선
- 에러 핸들링 강화

---

## [v1.0.0] - 2025-07-21 (초기 버전)

### 🆕 초기 기능
- 기본 이미지 업로드 기능
- 이미지 목록 조회
- URL 복사 기능
- 정적 파일 서빙
- CORS 지원
- 파일 크기 제한 (10MB)
- 이미지 파일 타입 검증

### 🛠️ 기술 스택
- Node.js + Express.js
- Multer (파일 업로드)
- 순수 JavaScript (프론트엔드)
- HTML5 + CSS3

---

## 🔮 계획된 기능 (Roadmap)

### v2.1.0 (예정)
- [ ] 보안 강화 (Path Traversal 방지, Rate Limiting)
- [ ] 인증 시스템
- [ ] 이미지 썸네일 생성
- [ ] 배치 작업 (다중 삭제, 이동)

### v3.0.0 (예정)
- [ ] 데이터베이스 연동
- [ ] 사용자 권한 관리
- [ ] 이미지 메타데이터 관리
- [ ] RESTful API 완전 지원
- [ ] 관리자 대시보드

---

## 📝 알려진 이슈

### 보안 관련
- ⚠️ Path Traversal 공격에 취약
- ⚠️ 파일 확장자 우회 공격 가능
- ⚠️ Rate Limiting 미적용
- ⚠️ 인증/권한 시스템 부재

### 기능적 이슈
- 폴더 삭제 기능 미구현
- 이미지 미리보기 크기 조절 불가
- 업로드 진행률 표시 없음

---

## 🤝 기여하기

1. 이 저장소를 Fork
2. 새 브랜치 생성 (`git checkout -b feature/새기능`)
3. 변경사항 커밋 (`git commit -am '새기능 추가'`)
4. 브랜치에 Push (`git push origin feature/새기능`)
5. Pull Request 생성

## 📄 라이선스

MIT License - 자세한 내용은 LICENSE 파일 참조
