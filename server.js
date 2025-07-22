const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const iconv = require('iconv-lite');
const session = require('express-session');
require('dotenv').config();

const app = express();

// 환경 변수 설정
const PORT = process.env.PORT || 31533;
const HOST = process.env.HOST || 'localhost';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || '앙기모띠123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'defaultSessionSecret123';
const API_KEY = process.env.API_KEY || 'defaultApiKey123';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_UPLOAD = parseInt(process.env.MAX_FILES_PER_UPLOAD) || 10;
const ALLOWED_EXTENSIONS = process.env.ALLOWED_IMAGE_EXTENSIONS ? 
  process.env.ALLOWED_IMAGE_EXTENSIONS.split(',') : 
  ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
const ALLOWED_MIME_TYPES = process.env.ALLOWED_MIME_TYPES ? 
  process.env.ALLOWED_MIME_TYPES.split(',') : 
  ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

// CORS 설정
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  credentials: true
};

if (process.env.ENABLE_CORS === 'true') {
  app.use(cors(corsOptions));
}

// 세션 설정
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // HTTPS가 아닌 환경에서는 false
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

// JSON 파싱
app.use(express.json());

// 이미지 업로드 디렉토리 설정
const uploadDir = path.join(__dirname, UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // req.body가 아직 파싱되지 않았을 수 있으므로 일단 임시 폴더 사용
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 한글 파일명을 안전하게 처리
    const timestamp = Date.now();
    const randomString = Math.round(Math.random() * 1E9);
    
    // 파일명 인코딩 처리
    let originalName;
    try {
      // iconv-lite로 한글 파일명 디코딩
      const buffer = Buffer.from(file.originalname, 'binary');
      originalName = iconv.decode(buffer, 'utf8');
      
      // 디코딩이 제대로 안된 경우 다른 방법 시도
      if (originalName.includes('�') || /[À-ÿ]/.test(originalName)) {
        originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      }
    } catch (error) {
      console.log('파일명 디코딩 실패, 원본 사용:', error.message);
      originalName = file.originalname;
    }
    
    const originalExt = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, originalExt);
    
    // 한글, 영문, 숫자, 일부 특수문자만 허용
    const safeName = baseName
      .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ\-_.()]/g, '') // 허용되지 않는 문자 제거
      .replace(/\s+/g, '_') // 공백을 언더스코어로 변경
      .trim()
      .substring(0, 50); // 길이 제한
    
    // 안전한 파일명 생성 (한글이 포함된 경우와 아닌 경우를 구분)
    let finalName;
    if (safeName && safeName.length > 0) {
      finalName = `${safeName}${originalExt}`;
    } else {
      finalName = `${originalExt}`;
    }
    cb(null, finalName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용 - 환경 변수 기반 검증
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('허용되지 않는 파일 형식입니다.'), false);
    }
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_UPLOAD
  }
});

// 정적 파일 제공 (폴더 구조 지원)
app.use('/images', express.static(uploadDir));

// 로그인 페이지
app.get('/login', (req, res) => {
  const error = req.query.error;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>이미지 서버 로그인</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0; 
                background-color: #f5f5f5; 
            }
            .login-container { 
                background: white; 
                padding: 40px; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                text-align: center; 
                max-width: 400px; 
                width: 100%; 
            }
            .login-container h2 { 
                color: #333; 
                margin-bottom: 20px; 
            }
            .login-container p { 
                color: #666; 
                margin-bottom: 30px; 
            }
            .login-container input { 
                width: 100%; 
                padding: 12px; 
                border: 1px solid #ddd; 
                border-radius: 5px; 
                margin-bottom: 20px; 
                box-sizing: border-box; 
                font-size: 16px; 
            }
            .login-container button { 
                width: 100%; 
                padding: 12px; 
                background: #007cba; 
                color: white; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer; 
                font-size: 16px; 
            }
            .login-container button:hover { 
                background: #005a8a; 
            }
            .error { 
                color: #dc3545; 
                margin-bottom: 20px; 
                font-size: 14px; 
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <h2>🔒 이미지 서버 로그인</h2>
            <p>이 서버에 접근하려면 비밀번호가 필요합니다.</p>
            ${error ? '<div class="error">잘못된 비밀번호입니다.</div>' : ''}
            <form action="/auth" method="POST">
                <input type="password" name="password" placeholder="비밀번호를 입력하세요" required>
                <button type="submit">로그인</button>
            </form>
        </div>
    </body>
    </html>
  `);
});

// 인증 처리
app.post('/auth', express.urlencoded({ extended: true }), (req, res) => {
  const { password } = req.body;
  
  if (password === ACCESS_PASSWORD) {
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.redirect('/login?error=1');
  }
});

// 로그아웃
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// 인증 미들웨어
function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/login');
  }
}

// API 키 인증 미들웨어
function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid or missing API key',
      message: 'API 키가 필요합니다. 헤더에 x-api-key 또는 쿼리 파라미터 api_key를 포함해주세요.'
    });
  }
  
  next();
}

// 메인 페이지 (인증 필요)
app.get('/', requireAuth, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>이미지 서버</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; height: 100vh; overflow: hidden; }
            h1 { margin: 0px;}
            h3 { margin: 0px;}
            .container { max-width: 1200px; margin: 0 auto; height: calc(100vh - 40px); display: flex; flex-direction: column; }
            .header { margin-bottom: 20px; }
            .controls-row { display: flex; gap: 20px; margin-bottom: 20px; }
            .folder-controls { flex: 1; padding: 15px; background: #f8f9fa; border-radius: 5px; border: 1px solid #ddd; }
            .folder-controls .controls { display: flex; gap: 10px; margin-bottom: 15px; align-items: center; }
            .upload-area { flex: 1; border: 2px dashed #ccc; padding: 20px; text-align: center; border-radius: 5px; }
            .folder-section { flex: 1; padding: 15px; border: 1px solid #ddd; border-radius: 5px; display: flex; flex-direction: column; overflow: hidden; }
            .folder-section .controls { display: flex; margin-bottom: 15px;align-items: center;
    justify-content: space-between; }
            .image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; overflow-y: auto; flex: 1; padding-right: 10px; }
            .image-item { border: 1px solid #ddd; padding: 10px; border-radius: 5px; position: relative; height: fit-content; }
            .image-item img { width: 100%; height: 150px; object-fit: cover; }
            .image-actions { margin-top: 10px; display: flex; gap: 5px; flex-wrap: wrap; }
            .image-actions button { font-size: 12px; padding: 5px 10px; }
            button { background: #007cba; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; margin: 2px; }
            button:hover { background: #005a8a; }
            button.danger { background: #dc3545; }
            button.danger:hover { background: #c82333; }
            input[type="file"], input[type="text"], select { margin: 10px 5px; padding: 8px; border: 1px solid #ddd; border-radius: 3px; }
            .current-folder { color: #007cba; font-weight: bold; }
            .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
            .modal-content { background: white; margin: 15% auto; padding: 20px; border-radius: 5px; width: 300px; }
            .close { color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer; }
            .close:hover { color: black; }
            /* 스크롤바 스타일링 */
            .image-grid::-webkit-scrollbar { width: 8px; }
            .image-grid::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
            .image-grid::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
            .image-grid::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
            .logout-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 5px; }
            .logout-btn { background: #dc3545; color: white; text-decoration: none; padding: 8px 16px; border-radius: 3px; font-size: 14px; }
            .logout-btn:hover { background: #c82333; }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- 로그아웃 버튼 -->
            <div class="logout-bar">
                <h1>🖼️ 이미지 서버</h1>
                <a href="/logout" class="logout-btn">로그아웃</a>
            </div>
            
            <!-- 폴더 관리와 업로드를 한 줄에 배치 -->
            <div class="controls-row">
                <!-- 폴더 관리 -->
                <div class="folder-controls">
                    <div class="controls">
                      <h3>폴더 관리</h3>
                      <div style="margin-top: 5px;">
                          <span class="current-folder" id="currentFolderDisplay">루트 폴더</span>
                      </div>
                    </div>
                      <div>
                          <input type="text" id="newFolderName" placeholder="새 폴더 이름">
                          <button onclick="createFolder()">폴더 생성</button>
                      </div>
                      <div style="margin-top: 10px;">
                          <label>현재 폴더: </label>
                          <select id="folderSelect" onchange="selectFolder()">
                              <option value="">루트 폴더</option>
                          </select>
                          <button onclick="loadFolders()">새로고침</button>
                      </div>
                </div>
                
                <!-- 업로드 영역 -->
                <div class="upload-area">
                    <h3>이미지 업로드</h3>
                    <form id="uploadForm" enctype="multipart/form-data">
                        <input type="file" id="imageInput" accept="image/*" required multiple>
                        <br>
                        <button type="submit">업로드</button>
                    </form>
                    <div id="uploadResult"></div>
                </div>
            </div>
            
            <!-- 이미지 목록 (스크롤 가능) -->
            <div class="folder-section">
                <div class="controls">
                    <h3>업로드된 이미지</h3>
                    <button onclick="loadImages()">이미지 목록 새로고침</button>
                </div>
                <div id="imageList" class="image-grid"></div>
            </div>
        </div>
        
        <!-- 이름 변경 모달 -->
        <div id="renameModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeRenameModal()">&times;</span>
                <h3>파일 이름 변경</h3>
                <input type="text" id="newFileName" placeholder="새 파일 이름">
                <br><br>
                <button onclick="confirmRename()">변경</button>
                <button onclick="closeRenameModal()">취소</button>
            </div>
        </div>
        
        <script>
            let currentFolder = '';
            let currentRenameImage = null;
            
            // 페이지 로드시 초기화
            document.addEventListener('DOMContentLoaded', function() {
                loadFolders();
                loadImages();
            });
            
            // 폴더 목록 로드
            async function loadFolders() {
                try {
                    const response = await fetch('/folders');
                    const folders = await response.json();
                    
                    const folderSelect = document.getElementById('folderSelect');
                    folderSelect.innerHTML = '<option value="">루트 폴더</option>';
                    
                    folders.forEach(folder => {
                        const option = document.createElement('option');
                        option.value = folder;
                        option.textContent = folder;
                        if (folder === currentFolder) {
                            option.selected = true;
                        }
                        folderSelect.appendChild(option);
                    });
                } catch (error) {
                    console.error('폴더 목록 로드 실패:', error);
                }
            }
            
            // 폴더 생성
            async function createFolder() {
                const folderName = document.getElementById('newFolderName').value.trim();
                if (!folderName) {
                    alert('폴더 이름을 입력해주세요.');
                    return;
                }
                
                try {
                    const response = await fetch('/create-folder', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ folderName })
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        alert('폴더가 생성되었습니다!');
                        document.getElementById('newFolderName').value = '';
                        loadFolders();
                    } else {
                        alert('폴더 생성 실패: ' + result.error);
                    }
                } catch (error) {
                    alert('폴더 생성 실패: ' + error.message);
                }
            }
            
            // 폴더 선택
            function selectFolder() {
                const folderSelect = document.getElementById('folderSelect');
                currentFolder = folderSelect.value;
                
                const display = document.getElementById('currentFolderDisplay');
                display.textContent = currentFolder || '루트 폴더';
                
                loadImages();
            }
            
            // 이미지 업로드
            document.getElementById('uploadForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const files = document.getElementById('imageInput').files;
                if (files.length === 0) return;
                
                const formData = new FormData();
                
                // 모든 파일을 한 번에 추가
                for (let file of files) {
                    formData.append('image', file);
                }
                
                if (currentFolder) {
                    formData.append('folder', currentFolder);
                }
                
                try {
                    const response = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        let resultHTML = '<div style="margin-top: 10px;">';
                        resultHTML += '<p style="color: green;">' + result.message + '</p>';
                        
                        if (result.files && result.files.length > 0) {
                            resultHTML += '<ul>';
                            resultHTML += '</ul>';
                        }
                        
                        if (result.errors && result.errors.length > 0) {
                            resultHTML += '<p style="color: orange;">실패한 파일:</p>';
                            resultHTML += '<ul>';
                            result.errors.forEach(error => {
                                resultHTML += '<li style="color: red;">✗ ' + error.filename + ': ' + error.error + '</li>';
                            });
                            resultHTML += '</ul>';
                        }
                        
                        resultHTML += '</div>';
                        document.getElementById('uploadResult').innerHTML = resultHTML;
                        
                        // 업로드 후 이미지 목록 새로고침
                        loadImages();
                        
                        // 폼 리셋
                        document.getElementById('uploadForm').reset();
                    } else {
                        document.getElementById('uploadResult').innerHTML = 
                            '<div style="margin-top: 10px;"><p style="color: red;">업로드 실패: ' + result.error + '</p></div>';
                    }
                } catch (error) {
                    document.getElementById('uploadResult').innerHTML = 
                        '<div style="margin-top: 10px;"><p style="color: red;">업로드 실패: ' + error.message + '</p></div>';
                }
            });
            
            // 이미지 목록 로드
            async function loadImages() {
                console.log('이미지 목록 로드 시작... 폴더:', currentFolder);
                try {
                    const url = currentFolder ? '/images-list/' + currentFolder : '/images-list';
                    const response = await fetch(url);
                    console.log('API 응답 상태:', response.status);
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch images');
                    }
                    
                    const images = await response.json();
                    console.log('받은 이미지 목록:', images);
                    
                    const imageListDiv = document.getElementById('imageList');
                    
                    if (images.length === 0) {
                        imageListDiv.innerHTML = '<p>업로드된 이미지가 없습니다.</p>';
                        return;
                    }
                    
                    // 기존 내용 초기화
                    imageListDiv.innerHTML = '';
                    
                    // 각 이미지에 대해 DOM 요소 생성
                    images.forEach((image) => {
                        console.log('이미지 처리 중:', image.filename);
                        const imageItem = document.createElement('div');
                        imageItem.className = 'image-item';
                        
                        const img = document.createElement('img');
                        img.src = image.url;
                        img.alt = image.filename;
                        img.style.width = '100%';
                        img.style.height = '150px';
                        img.style.objectFit = 'cover';
                        
                        const filenameP = document.createElement('p');
                        filenameP.innerHTML = '<strong>파일명:</strong> ' + image.filename;
                        
                        const urlP = document.createElement('p');
                        urlP.innerHTML = '<strong>URL:</strong> <a href="' + image.url + '" target="_blank">' + image.url + '</a>';
                        
                        const actionsDiv = document.createElement('div');
                        actionsDiv.className = 'image-actions';
                        
                        const copyButton = document.createElement('button');
                        copyButton.textContent = 'URL 복사';
                        copyButton.onclick = () => copyUrl(image.url);
                        
                        const renameButton = document.createElement('button');
                        renameButton.textContent = '이름 변경';
                        renameButton.onclick = () => openRenameModal(image);
                        
                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = '삭제';
                        deleteButton.className = 'danger';
                        deleteButton.onclick = () => deleteImage(image);
                        
                        actionsDiv.appendChild(copyButton);
                        actionsDiv.appendChild(renameButton);
                        actionsDiv.appendChild(deleteButton);
                        
                        imageItem.appendChild(img);
                        imageItem.appendChild(filenameP);
                        imageItem.appendChild(urlP);
                        imageItem.appendChild(actionsDiv);
                        
                        imageListDiv.appendChild(imageItem);
                    });
                    
                    console.log('이미지 목록 로드 완료');
                } catch (error) {
                    console.error('이미지 목록 로드 실패:', error);
                    document.getElementById('imageList').innerHTML = 
                        '<p style="color: red;">이미지 목록을 불러오는데 실패했습니다: ' + error.message + '</p>';
                }
            }
            
            // URL 복사
            function copyUrl(url) {
                navigator.clipboard.writeText(url).then(() => {
                    alert('URL이 클립보드에 복사되었습니다!');
                }).catch(err => {
                    console.error('URL 복사 실패:', err);
                    alert('URL 복사에 실패했습니다.');
                });
            }
            
            // 이미지 삭제
            async function deleteImage(image) {
                if (!confirm('"' + image.filename + '" 파일을 삭제하시겠습니까?')) {
                    return;
                }
                
                try {
                    const url = image.folder ? 
                        '/images/' + image.folder + '/' + image.filename : 
                        '/images/' + image.filename;
                    
                    const response = await fetch(url, {
                        method: 'DELETE'
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        alert('파일이 삭제되었습니다!');
                        loadImages();
                    } else {
                        alert('삭제 실패: ' + result.error);
                    }
                } catch (error) {
                    alert('삭제 실패: ' + error.message);
                }
            }
            
            // 이름 변경 모달 열기
            function openRenameModal(image) {
                currentRenameImage = image;
                document.getElementById('newFileName').value = image.filename;
                document.getElementById('renameModal').style.display = 'block';
            }
            
            // 이름 변경 모달 닫기
            function closeRenameModal() {
                document.getElementById('renameModal').style.display = 'none';
                currentRenameImage = null;
            }
            
            // 이름 변경 확인
            async function confirmRename() {
                if (!currentRenameImage) return;
                
                const newName = document.getElementById('newFileName').value.trim();
                if (!newName) {
                    alert('새 파일 이름을 입력해주세요.');
                    return;
                }
                
                try {
                    const url = currentRenameImage.folder ? 
                        '/images/' + currentRenameImage.folder + '/' + currentRenameImage.filename + '/rename' : 
                        '/images/' + currentRenameImage.filename + '/rename';
                    
                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ newName })
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        alert('파일 이름이 변경되었습니다!');
                        closeRenameModal();
                        loadImages();
                    } else {
                        alert('이름 변경 실패: ' + result.error);
                    }
                } catch (error) {
                    alert('이름 변경 실패: ' + error.message);
                }
            }
        </script>
    </body>
    </html>
  `);
});

// ==================== 외부 API 엔드포인트 ====================

// 외부 시스템용 이미지 업로드 API
app.post('/api/upload', requireApiKey, upload.array('image', MAX_FILES_PER_UPLOAD), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ 
      success: false,
      error: 'No files uploaded',
      message: '업로드할 파일이 없습니다.'
    });
  }
  
  const host = req.get('host');
  const protocol = req.protocol;
  const folder = req.body.folder || 'api-uploads'; // 기본적으로 api-uploads 폴더에 저장
  
  const uploadedFiles = [];
  const errors = [];
  
  for (const file of req.files) {
    try {
      // API 업로드는 항상 api-uploads 폴더 또는 지정된 폴더에 저장
      const targetDir = path.join(uploadDir, folder);
      
      // 폴더가 존재하지 않으면 생성
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      const oldPath = file.path;
      const newPath = path.join(targetDir, file.filename);
      
      // 파일을 지정된 폴더로 이동
      fs.renameSync(oldPath, newPath);
      
      const relativePath = `${folder}/${file.filename}`;
      const imageUrl = `${protocol}://${host}/images/${relativePath}`;
      
      uploadedFiles.push({
        filename: file.filename,
        originalName: file.originalname,
        url: imageUrl,
        size: file.size,
        folder: folder
      });
    } catch (error) {
      console.error('파일 처리 실패:', error);
      errors.push({
        filename: file.originalname,
        error: '파일 처리에 실패했습니다.'
      });
    }
  }
  
  if (uploadedFiles.length === 0) {
    return res.status(500).json({ 
      success: false,
      error: '모든 파일 업로드에 실패했습니다.',
      errors: errors
    });
  }
  
  const response = {
    success: true,
    message: `${uploadedFiles.length}개 파일 업로드 성공`,
    data: {
      files: uploadedFiles,
      count: uploadedFiles.length
    }
  };
  
  if (errors.length > 0) {
    response.errors = errors;
    response.message += `, ${errors.length}개 파일 실패`;
  }
  
  res.json(response);
});

// 외부 시스템용 단일 이미지 업로드 API (더 간단한 응답)
app.post('/api/upload-single', requireApiKey, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      error: 'No file uploaded',
      message: '업로드할 파일이 없습니다.'
    });
  }
  
  try {
    const host = req.get('host');
    const protocol = req.protocol;
    const folder = req.body.folder || 'api-uploads';
    
    // API 업로드는 항상 api-uploads 폴더 또는 지정된 폴더에 저장
    const targetDir = path.join(uploadDir, folder);
    
    // 폴더가 존재하지 않으면 생성
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const oldPath = req.file.path;
    const newPath = path.join(targetDir, req.file.filename);
    
    // 파일을 지정된 폴더로 이동
    fs.renameSync(oldPath, newPath);
    
    const relativePath = `${folder}/${req.file.filename}`;
    const imageUrl = `${protocol}://${host}/images/${relativePath}`;
    
    res.json({
      success: true,
      message: '파일 업로드 성공',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: imageUrl,
        size: req.file.size,
        folder: folder
      }
    });
    
  } catch (error) {
    console.error('파일 처리 실패:', error);
    res.status(500).json({
      success: false,
      error: '파일 처리에 실패했습니다.',
      message: error.message
    });
  }
});

// 외부 시스템용 이미지 목록 조회 API
app.get('/api/images', requireApiKey, (req, res) => {
  const folder = req.query.folder || 'api-uploads';
  const targetDir = path.join(uploadDir, folder);
  
  if (!fs.existsSync(targetDir)) {
    return res.json({
      success: true,
      message: '폴더가 존재하지 않습니다.',
      data: {
        files: [],
        count: 0,
        folder: folder
      }
    });
  }
  
  fs.readdir(targetDir, (err, files) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        error: 'Unable to read directory',
        message: '디렉토리를 읽을 수 없습니다.'
      });
    }
    
    const host = req.get('host');
    const protocol = req.protocol;
    
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file)
    ).map(file => {
      const filePath = path.join(targetDir, file);
      const stats = fs.statSync(filePath);
      const relativePath = `${folder}/${file}`;
      
      return {
        filename: file,
        url: `${protocol}://${host}/images/${relativePath}`,
        size: stats.size,
        uploadDate: stats.mtime,
        folder: folder
      };
    });
    
    // 업로드 날짜 기준 내림차순 정렬
    imageFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
    res.json({
      success: true,
      message: `${imageFiles.length}개의 이미지를 찾았습니다.`,
      data: {
        files: imageFiles,
        count: imageFiles.length,
        folder: folder
      }
    });
  });
});

// 외부 시스템용 이미지 삭제 API
app.delete('/api/images/:folder/:filename', requireApiKey, (req, res) => {
  const folder = req.params.folder;
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, folder, filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(404).json({ 
        success: false,
        error: 'File not found',
        message: '파일을 찾을 수 없습니다.'
      });
    }
    
    res.json({ 
      success: true,
      message: '파일이 성공적으로 삭제되었습니다.',
      data: {
        filename: filename,
        folder: folder
      }
    });
  });
});

// API 사용법 가이드 (인증 없이 접근 가능)
app.get('/api', (req, res) => {
  res.json({
    title: "Image Upload Server API",
    version: "1.0.0",
    description: "외부 시스템에서 이미지를 업로드하고 관리할 수 있는 API",
    authentication: {
      type: "API Key",
      header: "x-api-key",
      query: "api_key",
      note: "요청 시 헤더에 'x-api-key: YOUR_API_KEY' 또는 쿼리 파라미터 '?api_key=YOUR_API_KEY'를 포함해주세요."
    },
    endpoints: {
      "POST /api/upload": {
        description: "다중 이미지 업로드",
        parameters: {
          image: "파일 (multiple)",
          folder: "폴더명 (선택사항, 기본값: api-uploads)"
        },
        example: "curl -X POST -H 'x-api-key: YOUR_API_KEY' -F 'image=@image1.jpg' -F 'image=@image2.png' -F 'folder=my-folder' http://localhost:31533/api/upload"
      },
      "POST /api/upload-single": {
        description: "단일 이미지 업로드",
        parameters: {
          image: "파일",
          folder: "폴더명 (선택사항, 기본값: api-uploads)"
        },
        example: "curl -X POST -H 'x-api-key: YOUR_API_KEY' -F 'image=@image.jpg' -F 'folder=my-folder' http://localhost:31533/api/upload-single"
      },
      "GET /api/images": {
        description: "이미지 목록 조회",
        parameters: {
          folder: "폴더명 (쿼리 파라미터, 기본값: api-uploads)"
        },
        example: "curl -H 'x-api-key: YOUR_API_KEY' 'http://localhost:31533/api/images?folder=my-folder'"
      },
      "DELETE /api/images/:folder/:filename": {
        description: "이미지 삭제",
        example: "curl -X DELETE -H 'x-api-key: YOUR_API_KEY' http://localhost:31533/api/images/my-folder/image.jpg"
      },
      "GET /api/status": {
        description: "API 상태 확인",
        example: "curl -H 'x-api-key: YOUR_API_KEY' http://localhost:31533/api/status"
      }
    },
    response_format: {
      success: true,
      message: "설명 메시지",
      data: "응답 데이터",
      errors: "에러 목록 (있는 경우)"
    }
  });
});

// API 상태 확인 엔드포인트
app.get('/api/status', requireApiKey, (req, res) => {
  res.json({
    success: true,
    message: 'API가 정상적으로 작동 중입니다.',
    data: {
      server: 'Image Upload Server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      maxFileSize: `${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`,
      maxFiles: MAX_FILES_PER_UPLOAD,
      allowedExtensions: ALLOWED_EXTENSIONS
    }
  });
});

// ==================== 웹 인터페이스용 엔드포인트 ====================

// 이미지 업로드 API (다중 파일 지원)
app.post('/upload', requireAuth, upload.array('image', MAX_FILES_PER_UPLOAD), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const host = req.get('host');
  const protocol = req.protocol;
  const folder = req.body.folder || '';
  
  const uploadedFiles = [];
  const errors = [];
  
  for (const file of req.files) {
    try {
      // 폴더가 지정된 경우 파일을 해당 폴더로 이동
      if (folder) {
        const targetDir = path.join(uploadDir, folder);
        
        // 폴더가 존재하지 않으면 생성
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        const oldPath = file.path;
        const newPath = path.join(targetDir, file.filename);
        
        // 파일을 지정된 폴더로 이동
        fs.renameSync(oldPath, newPath);
        
        const relativePath = `${folder}/${file.filename}`;
        const imageUrl = `${protocol}://${host}/images/${relativePath}`;
        
        uploadedFiles.push({
          filename: file.filename,
          folder: folder,
          originalName: file.originalname,
          url: imageUrl,
          size: file.size
        });
      } else {
        // 루트 폴더에 저장
        const imageUrl = `${protocol}://${host}/images/${file.filename}`;
        
        uploadedFiles.push({
          filename: file.filename,
          folder: '',
          originalName: file.originalname,
          url: imageUrl,
          size: file.size
        });
      }
    } catch (error) {
      console.error('파일 처리 실패:', error);
      errors.push({
        filename: file.originalname,
        error: '파일 처리에 실패했습니다.'
      });
    }
  }
  
  if (uploadedFiles.length === 0) {
    return res.status(500).json({ 
      error: '모든 파일 업로드에 실패했습니다.',
      errors: errors
    });
  }
  
  const response = {
    message: `${uploadedFiles.length}개 파일 업로드 성공`,
    files: uploadedFiles
  };
  
  if (errors.length > 0) {
    response.errors = errors;
    response.message += `, ${errors.length}개 파일 실패`;
  }
  
  res.json(response);
});

// 폴더 생성 API
app.post('/create-folder', requireAuth, (req, res) => {
  const { folderName } = req.body;
  
  if (!folderName || folderName.trim() === '') {
    return res.status(400).json({ error: '폴더 이름이 필요합니다.' });
  }
  
  const folderPath = path.join(uploadDir, folderName);
  
  if (fs.existsSync(folderPath)) {
    return res.status(400).json({ error: '이미 존재하는 폴더입니다.' });
  }
  
  try {
    fs.mkdirSync(folderPath, { recursive: true });
    res.json({ message: '폴더가 생성되었습니다.', folderName });
  } catch (error) {
    res.status(500).json({ error: '폴더 생성에 실패했습니다.' });
  }
});

// 폴더 목록 조회 API
app.get('/folders', requireAuth, (req, res) => {
  fs.readdir(uploadDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read directory' });
    }
    
    const folders = files
      .filter(file => file.isDirectory())
      .map(folder => folder.name);
    
    res.json(folders);
  });
});

// 특정 폴더의 이미지 목록 조회 API
app.get('/images-list', requireAuth, (req, res) => {
  const targetDir = uploadDir;
  
  fs.readdir(targetDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read directory' });
    }
    
    const host = req.get('host');
    const protocol = req.protocol;
    
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file)
    ).map(file => {
      const filePath = path.join(targetDir, file);
      const stats = fs.statSync(filePath);
      
      return {
        filename: file,
        folder: '',
        url: `${protocol}://${host}/images/${file}`,
        size: stats.size,
        uploadDate: stats.mtime
      };
    });
    
    // 업로드 날짜 기준 내림차순 정렬
    imageFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
    res.json(imageFiles);
  });
});

app.get('/images-list/:folder', requireAuth, (req, res) => {
  const folder = req.params.folder;
  const targetDir = path.join(uploadDir, folder);
  
  if (!fs.existsSync(targetDir)) {
    return res.status(404).json({ error: '폴더를 찾을 수 없습니다.' });
  }
  
  fs.readdir(targetDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read directory' });
    }
    
    const host = req.get('host');
    const protocol = req.protocol;
    
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file)
    ).map(file => {
      const filePath = path.join(targetDir, file);
      const stats = fs.statSync(filePath);
      const relativePath = `${folder}/${file}`;
      
      return {
        filename: file,
        folder: folder,
        url: `${protocol}://${host}/images/${relativePath}`,
        size: stats.size,
        uploadDate: stats.mtime
      };
    });
    
    // 업로드 날짜 기준 내림차순 정렬
    imageFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
    res.json(imageFiles);
  });
});

// 루트 디렉토리 이미지 삭제 API
app.delete('/images/:filename', requireAuth, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({ message: 'File deleted successfully' });
  });
});

// 폴더 내 이미지 삭제 API
app.delete('/images/:folder/:filename', requireAuth, (req, res) => {
  const folder = req.params.folder;
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, folder, filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({ message: 'File deleted successfully' });
  });
});

// 루트 디렉토리 이미지 이름 변경 API
app.put('/images/:filename/rename', requireAuth, (req, res) => {
  const filename = req.params.filename;
  const { newName } = req.body;
  
  if (!newName || newName.trim() === '') {
    return res.status(400).json({ error: '새 파일 이름이 필요합니다.' });
  }
  
  const oldPath = path.join(uploadDir, filename);
  const newPath = path.join(uploadDir, newName);
  
  if (fs.existsSync(newPath)) {
    return res.status(400).json({ error: '이미 존재하는 파일 이름입니다.' });
  }
  
  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      return res.status(500).json({ error: '파일 이름 변경에 실패했습니다.' });
    }
    
    const host = req.get('host');
    const protocol = req.protocol;
    const newUrl = `${protocol}://${host}/images/${newName}`;
    
    res.json({ 
      message: '파일 이름이 변경되었습니다.',
      newUrl: newUrl,
      newName: newName
    });
  });
});

// 폴더 내 이미지 이름 변경 API
app.put('/images/:folder/:filename/rename', requireAuth, (req, res) => {
  const folder = req.params.folder;
  const filename = req.params.filename;
  const { newName } = req.body;
  
  if (!newName || newName.trim() === '') {
    return res.status(400).json({ error: '새 파일 이름이 필요합니다.' });
  }
  
  const oldPath = path.join(uploadDir, folder, filename);
  const newPath = path.join(uploadDir, folder, newName);
  
  if (fs.existsSync(newPath)) {
    return res.status(400).json({ error: '이미 존재하는 파일 이름입니다.' });
  }
  
  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      return res.status(500).json({ error: '파일 이름 변경에 실패했습니다.' });
    }
    
    const host = req.get('host');
    const protocol = req.protocol;
    const newUrl = `${protocol}://${host}/images/${folder}/${newName}`;
    
    res.json({ 
      message: '파일 이름이 변경되었습니다.',
      newUrl: newUrl,
      newName: newName
    });
  });
});

// 에러 핸들러
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `파일 크기가 너무 큽니다. (최대 ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)` });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: `파일 개수가 너무 많습니다. (최대 ${MAX_FILES_PER_UPLOAD}개)` });
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }
  
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`🚀 이미지 서버가 http://${HOST}:${PORT} 에서 실행 중입니다`);
  console.log(`📁 이미지 저장 경로: ${uploadDir}`);
  console.log(`🌐 이미지 접근 URL 예시: http://${HOST}:${PORT}/images/filename.jpg`);
  console.log(`⚙️  최대 파일 크기: ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`);
  console.log(`📊 최대 동시 업로드: ${MAX_FILES_PER_UPLOAD}개 파일`);
  console.log(`🔒 CORS 활성화: ${process.env.ENABLE_CORS === 'true' ? '예' : '아니오'}`);
});
