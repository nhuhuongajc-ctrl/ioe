import { Post, DocumentItem } from '../../../src/shared/types/content.js';

export const INITIAL_SEED_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'Bí kíp phân bổ thời gian đạt 1900+ điểm IOE 200 câu trong 30 phút',
    slug: 'bi-kip-phan-bo-thoi-gian-ioe-200-cau',
    summary: 'Hướng dẫn chiến thuật hoàn thành 200 câu hỏi IOE trong 30 phút mà không bị cuống, tăng độ chính xác lên 95%.',
    content: `### 1. Hiểu rõ cấu trúc bài thi IOE 200 câu
Bài thi IOE chính thức kéo dài 30 phút với tối đa 200 câu hỏi. Như vậy, trung bình học sinh chỉ có **9 giây cho mỗi câu hỏi**. Để đạt trên 1900/2000 điểm:
- **Câu dễ (Nhận biết từ vựng qua tranh, chọn từ điền chỗ trống cơ bản):** Phản xạ trong 3 - 5 giây.
- **Câu dạng sắp xếp từ thành câu (Ordering words):** Cần nhận diện nhanh chủ ngữ, động từ chính và cụm trạng từ chỉ thời gian/nơi chốn.
- **Câu nghe tranh & bài nghe:** Cần tập trung lắng nghe keyword chính ngay lượt nghe đầu tiên.

### 2. Các mẹo quan trọng khi làm bài
1. **Luyện kỹ năng gõ bàn phím 10 ngón:** Rất nhiều câu hỏi dạng điền chữ cái còn thiếu hoặc gõ câu trả lời, nếu gõ chậm sẽ mất nhiều giây quý giá.
2. **Không dừng lại quá 20 giây ở một câu khó:** Hãy đưa ra đáp án phỏng đoán hợp lý nhất và tiến nhanh sang câu tiếp theo.
3. **Giữ tâm lý vững vàng:** Hãy tạo thói quen thi thử tại môi trường mô phỏng chuẩn IOE Master trước ngày thi chính thức.`,
    coverMediaId: null,
    authorUid: 'teacher-demo-1',
    authorName: 'Cô Hoàng Thu Thảo',
    authorRole: 'teacher',
    grade: 5,
    category: 'tips',
    tags: ['Kinh nghiệm', 'Mẹo thi', 'Lớp 5', 'Quốc gia'],
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    viewCount: 1420,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'post-2',
    title: 'Tổng hợp 30 Cấu trúc Ngữ pháp Tiếng Anh thường gặp nhất trong kỳ thi IOE',
    slug: 'tong-hop-30-cau-truc-ngu-phap-ioe',
    summary: 'Hệ thống hóa toàn bộ các cấu trúc thì hiện tại đơn, hiện tại tiếp diễn, câu so sánh, câu hỏi với từ để hỏi và mạo từ.',
    content: `### Top các chủ điểm ngữ pháp trọng tâm:

1. **Thì Hiện Tại Đơn (Present Simple):**
   - Diễn tả thói quen hoặc sự thật hiển nhiên.
   - Dấu hiệu: *always, usually, often, sometimes, never, every day...*
   - Chú ý chia động từ ngôi thứ 3 số ít: *adds -s/-es*.

2. **Thì Hiện Tại Tiếp Diễn (Present Continuous):**
   - Diễn tả hành động đang xảy ra tại thời điểm nói.
   - Cấu trúc: *S + am/is/are + V-ing*.
   - Dấu hiệu: *Look!, Listen!, at the moment, now...*

3. **Cấu trúc Hỏi & Chỉ đường (Directions):**
   - *Excuse me, how can I get to the post office?*
   - *Go straight ahead, turn left at the corner.*

4. **Câu so sánh hơn & so sánh nhất (Comparative & Superlative):**
   - Tính từ ngắn: *S1 + be + adj-er + than + S2*
   - Tính từ dài: *S1 + be + more + adj + than + S2*`,
    coverMediaId: null,
    authorUid: 'admin-1',
    authorName: 'Ban Chuyên Môn IOE',
    authorRole: 'super_admin',
    grade: 0,
    category: 'grammar',
    tags: ['Ngữ pháp', 'Cấu trúc', 'Trọng điểm'],
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    viewCount: 2890,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'post-3',
    title: 'Thông báo Lịch Thi Thử IOE Trực Tuyến Toàn Quốc 2026',
    slug: 'thong-bao-lich-thi-thu-ioe-toan-quoc',
    summary: 'Hệ thống mở phòng thi thử cấp Trường, cấp Huyện và cấp Tỉnh định kỳ hàng tuần cho học sinh từ Lớp 3 đến Lớp 12.',
    content: `Hệ thống IOE Master thông báo lịch mở phòng thi thử miễn phí dành cho toàn bộ học sinh trên cả nước:
- **Thời gian mở phòng thi thử:** 24/7 hàng ngày.
- **Quy mô đề thi:** Đầy đủ 200 câu hỏi chia đều 4 kỹ năng (Từ vựng, Ngữ pháp, Đọc hiểu, Nghe tranh/đoạn hội thoại).
- **Hệ thống chấm điểm tự động & Bảng vinh danh:** Kết quả thi được cập nhật tức thì trên Bảng xếp hạng Tuần và Tháng.`,
    coverMediaId: null,
    authorUid: 'admin-1',
    authorName: 'Ban Quản Trị Hệ Thống',
    authorRole: 'super_admin',
    grade: 0,
    category: 'announcement',
    tags: ['Thông báo', 'Lịch thi', 'Toàn quốc'],
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    viewCount: 3510,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const INITIAL_SEED_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Bộ 10 Đề Thi Thử IOE Lớp 5 Chuẩn Cấp Tỉnh (Kèm Đáp Án & Lời Giải Chi Tiết)',
    description: 'Tài liệu PDF 120 trang tổng hợp các dạng bài khó nhất cấp Tỉnh/Thành phố dành cho học sinh Lớp 5 chuẩn bị thi chọn đội tuyển.',
    fileName: 'Bo_10_De_Thi_Thu_IOE_Lop_5_Cap_Tinh.pdf',
    storedName: 'doc_seed_de_thi_lop_5.pdf',
    mimeType: 'application/pdf',
    fileSize: 4500000,
    storagePath: '/home/qzmivzbj/app-data/ioe/media/documents/doc_seed_de_thi_lop_5.pdf',
    uploaderUid: 'teacher-demo-1',
    uploaderName: 'Cô Hoàng Thu Thảo',
    status: 'published',
    grade: 5,
    category: 'exam_paper',
    downloadCount: 840,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: 'doc-2',
    title: 'Sổ tay 600 Từ vựng Tiếng Anh Trọng Tâm Lớp 3-4-5 Theo Chủ Điểm (Kèm Phiên Âm IPA)',
    description: 'Bảng tổng hợp từ vựng có hình ảnh minh họa, phiên âm chuẩn quốc tế và nghĩa tiếng Việt dành cho khối Tiểu học.',
    fileName: 'So_Tay_600_Tu_Vung_Trong_Tam_Tieu_Hoc.pdf',
    storedName: 'doc_seed_so_tay_tu_vung.pdf',
    mimeType: 'application/pdf',
    fileSize: 2800000,
    storagePath: '/home/qzmivzbj/app-data/ioe/media/documents/doc_seed_so_tay_tu_vung.pdf',
    uploaderUid: 'teacher-demo-1',
    uploaderName: 'Cô Hoàng Thu Thảo',
    status: 'published',
    grade: 5,
    category: 'vocabulary_sheet',
    downloadCount: 1620,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'doc-3',
    title: 'File Audio 50 Bài Luyện Nghe Tranh & Đoạn Hội Thoại IOE Chuẩn Giọng Bản Xứ',
    description: 'Tuyển tập 50 bài nghe chất lượng cao MP3 luyện phản xạ các tình huống giao tiếp, mô tả đồ vật và con vật thường gặp trong bài thi.',
    fileName: 'Audio_Luyen_Nghe_IOE_50_Bai.mp3',
    storedName: 'doc_seed_audio_50_bai.mp3',
    mimeType: 'audio/mpeg',
    fileSize: 12500000,
    storagePath: '/home/qzmivzbj/app-data/ioe/media/documents/doc_seed_audio_50_bai.mp3',
    uploaderUid: 'admin-1',
    uploaderName: 'Ban Chuyên Môn IOE',
    status: 'published',
    grade: 5,
    category: 'audio_listening',
    downloadCount: 950,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'doc-4',
    title: 'Tuyển Tập Đề Luyện Thi IOE Lớp 6-7-8-9 Chuẩn Cấp Huyện & Quốc Gia',
    description: 'Bộ đề thi nâng cao dành cho học sinh khối THCS với các bài đọc hiểu chuyên sâu và bài tập điền từ nâng cao.',
    fileName: 'Tuyen_Tap_De_Thi_IOE_THCS.pdf',
    storedName: 'doc_seed_de_thi_thcs.pdf',
    mimeType: 'application/pdf',
    fileSize: 5200000,
    storagePath: '/home/qzmivzbj/app-data/ioe/media/documents/doc_seed_de_thi_thcs.pdf',
    uploaderUid: 'admin-1',
    uploaderName: 'Ban Quản Trị Hệ Thống',
    status: 'published',
    grade: 7,
    category: 'exam_paper',
    downloadCount: 710,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];
