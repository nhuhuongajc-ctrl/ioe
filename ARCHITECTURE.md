# KIẾN TRÚC HỆ THỐNG LUYỆN THI IOE (cPanel + Node.js 22 + SQLite + Firebase Auth)

Tài liệu thiết kế kiến trúc kỹ thuật toàn diện cho nền tảng Luyện thi IOE Tiếng Anh Quốc Gia, tối ưu hóa cho môi trường triển khai **cPanel Shared/VPS Hosting** với hiệu năng cao, chi phí tối thiểu, không phụ thuộc Docker/Supabase/PostgreSQL/Redis, và dễ dàng bảo trì.

---

## 1. TỔNG QUAN VÀ MỤC TIÊU HẠ TẦNG

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER (React + Vite SPA)                     │
│  - Firebase Auth SDK (Google Login / Email) -> Lấy Firebase ID Token            │
│  - Phục vụ tĩnh từ: dist/client (hoặc dist/) qua Express                        │
│  - Giao tiếp Backend: Authorization: Bearer <firebase_id_token>                 │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ HTTPS /api/...
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                   BACKEND ENGINE (Node.js 22.x on cPanel)                       │
│  - Entry point: app.js -> nạp dist/server.cjs (đã bundle qua esbuild)          │
│  - Express REST API (/api/...)                                                  │
│  - Firebase Admin SDK (xác thực verifyIdToken, KHÔNG dùng Firestore)            │
│  - Authoritative Grading Engine (Bảo mật 100% đáp án bí mật)                    │
│  - Anti-Tamper Ticket Token & Batch Answer Saver                                │
└───────────────────────┬─────────────────────────────────┬───────────────────────┘
                        │                                 │
           better-sqlite3 (WAL Mode)               Local FileSystem
                        │                                 │
                        ▼                                 ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────────┐
│     SQLITE DATABASE (Production)     │  │        MEDIA ASSETS STORAGE           │
│ /home/qzmivzbj/app-data/ioe/         │  │ /home/qzmivzbj/app-data/ioe/          │
│               └── app.sqlite         │  │ ├── images/                           │
│ - Tách biệt hoàn toàn code deploy    │  │ └── audio/                            │
│ - WAL Mode + Transactions            │  │ (Pluggable: chuyển Cloudflare R2 dễ)  │
│ - Idempotent additive migrations     │  └───────────────────────────────────────┘
└──────────────────────────────────────┘
```

### 1.1 Mục tiêu triển khai
* **Domain chính**: `https://ioe.msdieu.com`
* **cPanel Application Root**: `ioe.msdieu.com`
* **Startup file**: `app.js` (chạy Node.js 22.x qua cPanel Setup Node.js App / Phusion Passenger).
* **Bundle đầu ra**:
  - Client: `dist/client/` (HTML, JS, CSS, assets)
  - Server: `dist/server.cjs` (single-file CommonJS bundle tự đóng gói mọi module nội bộ, loại bỏ lỗi resolve ESM).
* **Độc lập dữ liệu**: Thư mục database và media nằm ngoài thư mục web root deploy (`/home/qzmivzbj/app-data/ioe/`), đảm bảo khi deploy code mới không bao giờ ghi đè hoặc làm mất dữ liệu người dùng.

---

## 2. KIẾN TRÚC XÁC THỰC (AUTHENTICATION & RBAC)

### 2.1 Luồng xác thực
1. **Frontend**: Người dùng đăng nhập qua Firebase Auth (Google Sign-In hoặc Email/Password).
2. **Token**: Frontend lấy `idToken = await user.getIdToken()` và đính kèm vào header:
   ```http
   Authorization: Bearer <idToken>
   ```
3. **Backend Middleware (`server/auth/authMiddleware.ts`)**:
   - Sử dụng `firebase-admin` (`adminAuth.verifyIdToken(token)`) để giải mã và xác minh chữ ký.
   - Trích xuất `uid` (định danh tài khoản ổn định suốt đời), `email`, `name`, `picture`.
   - Tra cứu và tự động đồng bộ hồ sơ trong bảng `users` của SQLite.
   - Gán `req.user` vào request context cho các router xử lý tiếp.

### 2.2 Phân quyền (RBAC)
* `student`: Học sinh tham gia luyện tập, thi thử, xem bảng xếp hạng, lịch sử thi cá nhân.
* `teacher`: Giáo viên tạo câu hỏi, duyệt câu hỏi AI, quản lý đề thi Blueprint, xem thống kê học sinh.
* `super_admin`: Quản trị viên hệ thống toàn quyền, cấu hình hệ thống, quản lý tài khoản, audit logs.
* `guest`: Khách trải nghiệm nhanh (không lưu điểm chính thức vào bảng vàng).

### 2.3 Cam kết không dùng Firestore
Firebase **chỉ đảm nhiệm định danh (Identity Provider)**. Toàn bộ dữ liệu ngân hàng câu hỏi, đề thi, lịch sử làm bài, bảng xếp hạng và logs đều lưu trữ trong SQLite cục bộ.

---

## 3. KIẾN TRÚC DỮ LIỆU (SQLITE + BETTER-SQLITE3)

### 3.1 Cấu hình Engine
* **Driver**: `better-sqlite3` (C-binding synchronous, tốc độ xử lý hàng chục nghìn truy vấn/giây với độ trễ microsecond).
* **Chế độ WAL (Write-Ahead Logging)**:
  ```sql
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;
  PRAGMA temp_store = MEMORY;
  PRAGMA cache_size = -64000; -- 64MB Cache
  ```
* **Đường dẫn Production**: `/home/qzmivzbj/app-data/ioe/app.sqlite` (cấu hình qua biến môi trường `SQLITE_DB_PATH`).

### 3.2 Sơ đồ bảng (Additive & Normalized)
1. `users`: Lưu thông tin học sinh/giáo viên (`id` = Firebase UID, `email`, `role`, `grade`, `school_name`, `stats_json`).
2. `questions`: Ngân hàng câu hỏi chuẩn IOE (`id`, `grade`, `skill`, `topic`, `difficulty`, `interaction_json`, `prompt`, `answer_json`, `quality_status`, `source_json`, `statistics_json`).
3. `exam_blueprints`: Ma trận cấu trúc đề thi chính thức và đề thi thử (`id`, `title`, `grade`, `competition_level`, `duration_minutes`, `total_questions`, `skill_dist_json`, `difficulty_dist_json`).
4. `attempts`: Lượt thi học sinh (`id`, `user_id`, `grade`, `mode`, `blueprint_id`, `duration_minutes`, `question_snapshots_json`, `user_answers_json`, `score`, `status`, `started_at`, `submitted_at`).
5. `leaderboard_records`: Bảng xếp hạng vinh danh (`id`, `user_id`, `user_name`, `grade`, `score`, `duration_seconds`, `competition_level`, `recorded_at`).
6. `media_records`: Quản lý siêu dữ liệu tập tin âm thanh/hình ảnh (`id`, `file_name`, `mime_type`, `file_size`, `relative_path`, `storage_driver`, `created_at`).
7. `audit_logs`: Nhật ký thao tác quản trị (`id`, `user_id`, `user_email`, `action`, `resource_type`, `resource_id`, `details_json`, `created_at`).

### 3.3 Chỉ mục tăng tốc (Performance Indexes)
```sql
CREATE INDEX IF NOT EXISTS idx_questions_grade_skill ON questions(grade, skill, quality_status);
CREATE INDEX IF NOT EXISTS idx_questions_quality ON questions(quality_status);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON attempts(status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_grade_score ON leaderboard_records(grade, score DESC, duration_seconds ASC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
```

---

## 4. QUẢN LÝ MEDIA (HÌNH ẢNH & ÂM THANH)

### 4.1 Cơ chế lưu trữ ban đầu (Local Filesystem)
* **Thư mục hình ảnh**: `/home/qzmivzbj/app-data/ioe/images/`
* **Thư mục âm thanh**: `/home/qzmivzbj/app-data/ioe/audio/`
* **API phát/tải media**: `GET /api/media/:type/:filename`
* **Quy tắc**: Tuyệt đối không lưu file binary hoặc chuỗi Base64 dài vào SQLite database.

### 4.2 Tính tương thích tương lai (Pluggable Cloudflare R2 / S3)
Hệ thống triển khai qua interface `IMediaStorage`:
```typescript
export interface IMediaStorage {
  saveFile(fileBuffer: Buffer, fileName: string, mimeType: string, category: 'images' | 'audio'): Promise<string>;
  getFilePath(category: 'images' | 'audio', fileName: string): string | null;
  deleteFile(category: 'images' | 'audio', fileName: string): Promise<boolean>;
}
```
Khi chuyển sang Cloudflare R2 trong tương lai, chỉ cần tạo `R2MediaStorage` triển khai interface trên và thay đổi biến môi trường `MEDIA_STORAGE_DRIVER=r2`, toàn bộ router và database giữ nguyên 100%.

---

## 5. BẢO MẬT & CHỐNG GIAN LẬN THI THỬ

1. **Bảo mật Đáp án (Answer Key Concealment)**:
   - Khi học sinh bấm vào phòng thi, API `/api/ioe/attempts/start` chỉ trả về danh sách câu hỏi **đã loại bỏ hoàn toàn trường `answer`** (không gửi `correctOptionId`, `acceptedAnswers`, `correctPairMatches`).
   - Học sinh mở F12 DevTools cũng không thể xem trước đáp án.
2. **Chấm điểm Authoritative độc quyền tại Server**:
   - Khi nộp bài (`/api/ioe/attempts/:id/submit`), Backend lấy câu hỏi gốc từ DB để so sánh, tính điểm và lưu điểm vào DB trước khi trả kết quả giải thích chi tiết.
3. **Signed Ticket Token**:
   - Mỗi phiên thi được cấp `ticketToken` ký mã hóa bằng `ATTEMPT_SIGNING_SECRET`, gắn liền với `attemptId`, `userId`, `startTime`.
4. **Thời gian thi Server-Authoritative**:
   - Thời gian làm bài tính toán dựa trên `startedAt` lưu ở database, không phụ thuộc vào đồng hồ máy tính của học sinh.
5. **Batch Answer Persistence**:
   - Trong lúc thi, frontend giữ câu trả lời trong state và gửi định kỳ theo lô (`/api/ioe/attempts/:id/answers-batch`) nhằm giảm thiểu tải I/O và hỗ trợ phục hồi nếu rớt mạng.

---

## 6. QUY TRÌNH DEPLOY VÀ VẬN HÀNH TRÊN cPANEL

### 6.1 Biến môi trường trên cPanel (.env)
```env
PORT=3000
NODE_ENV=production
STORAGE_MODE=sqlite
SQLITE_DB_PATH=/home/qzmivzbj/app-data/ioe/app.sqlite
MEDIA_STORAGE_PATH=/home/qzmivzbj/app-data/ioe

FIREBASE_PROJECT_ID=ioe-msdieu
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ioe-msdieu.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

ATTEMPT_SIGNING_SECRET=cPanel_Secure_IOE_Key_2026_SecretString!
```

### 6.2 Cấu hình Frontend Vite (.env)
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=ioe-msdieu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ioe-msdieu
VITE_FIREBASE_STORAGE_BUCKET=ioe-msdieu.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

### 6.3 Lệnh Build & Triển khai
```bash
# 1. Build cả Client và Server
npm run build

# 2. Chạy kiểm tra preflight kiểm tra thư mục SQLite & Media
node scripts/db-preflight/preflight.js

# 3. Chạy migration tạo bảng an toàn (Additive / Idempotent)
node scripts/db-migrate/migrate.js

# 4. Sao lưu dữ liệu định kỳ
node scripts/db-backup/backup.js
```
