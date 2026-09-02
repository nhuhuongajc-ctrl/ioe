import { ExamBlueprint } from '../../../src/shared/types/ioe.js';

export const INITIAL_SEED_BLUEPRINTS: ExamBlueprint[] = [
  // ================= GRADE 1 (100 CÂU / 30 PHÚT) =================
  {
    id: 'bp-g1-school',
    title: 'IOE Lớp 1 - Cấp Trường (100 câu / 30 phút)',
    description: 'Đề thi thử IOE Lớp 1 Cấp Trường. Tập trung vào bảng chữ cái, màu sắc, số đếm từ 1-10, các con vật nuôi và đồ dùng học tập quen thuộc.',
    grade: 1,
    competitionLevel: 'school',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 100,
    skillDistribution: { vocabulary: 60, grammar: 15, reading: 10, listening: 15 },
    difficultyDistribution: { 1: 65, 2: 25, 3: 10 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g1-district',
    title: 'IOE Lớp 1 - Cấp Quận/Huyện (100 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 1 Cấp Huyện. Mở rộng từ vựng gia đình, đồ chơi, cơ thể và câu chào hỏi đơn giản.',
    grade: 1,
    competitionLevel: 'district',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 100,
    skillDistribution: { vocabulary: 50, grammar: 25, reading: 10, listening: 15 },
    difficultyDistribution: { 1: 40, 2: 40, 3: 20 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g1-province',
    title: 'IOE Lớp 1 - Cấp Tỉnh/TP & Quốc Gia (100 câu / 30 phút)',
    description: 'Đề thi thử Lớp 1 Cấp Tỉnh/Toàn quốc với dạng bài điền chữ cái còn thiếu, sắp xếp từ và nghe phản xạ.',
    grade: 1,
    competitionLevel: 'province',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 100,
    skillDistribution: { vocabulary: 45, grammar: 30, reading: 10, listening: 15 },
    difficultyDistribution: { 1: 25, 2: 45, 3: 30 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g1-mini',
    title: 'IOE Lớp 1 - Mini Test Khởi Động (20 câu)',
    description: 'Bài luyện nhanh 20 câu kiểm tra phản xạ từ vựng và hình ảnh.',
    grade: 1,
    competitionLevel: 'practice',
    isOfficialMock: false,
    durationMinutes: 10,
    totalQuestions: 20,
    skillDistribution: { vocabulary: 12, grammar: 4, reading: 2, listening: 2 },
    difficultyDistribution: { 1: 15, 2: 5 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },

  // ================= GRADE 2 (100 CÂU / 30 PHÚT) =================
  {
    id: 'bp-g2-school',
    title: 'IOE Lớp 2 - Cấp Trường (100 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 2 Cấp Trường. Kiểm tra số đếm 1-20, món ăn, thức uống, hình dạng và hoạt động hằng ngày.',
    grade: 2,
    competitionLevel: 'school',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 100,
    skillDistribution: { vocabulary: 55, grammar: 25, reading: 10, listening: 10 },
    difficultyDistribution: { 1: 50, 2: 35, 3: 15 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g2-district',
    title: 'IOE Lớp 2 - Cấp Quận/Huyện (100 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 2 Cấp Huyện. Luyện tập câu hỏi This is / That is, What is this?, Can you...?',
    grade: 2,
    competitionLevel: 'district',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 100,
    skillDistribution: { vocabulary: 50, grammar: 30, reading: 10, listening: 10 },
    difficultyDistribution: { 1: 35, 2: 45, 3: 20 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g2-province',
    title: 'IOE Lớp 2 - Cấp Tỉnh & Toàn Quốc (100 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 2 Cấp Tỉnh/Quốc Gia nâng cao với các dạng ghép nối, sắp xếp câu và điền chữ cái khuyết.',
    grade: 2,
    competitionLevel: 'province',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 100,
    skillDistribution: { vocabulary: 45, grammar: 35, reading: 10, listening: 10 },
    difficultyDistribution: { 1: 20, 2: 50, 3: 30 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },

  // ================= GRADE 3 (200 CÂU / 30 PHÚT) =================
  {
    id: 'bp-g3-school',
    title: 'IOE Lớp 3 - Cấp Trường (200 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 3 Cấp Trường chuẩn 200 câu trong 30 phút. Bao quát chương trình học kì 1 & 2 tiếng Anh Tiểu học.',
    grade: 3,
    competitionLevel: 'school',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 90, grammar: 60, reading: 25, listening: 25 },
    difficultyDistribution: { 1: 70, 2: 80, 3: 40, 4: 10 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g3-district',
    title: 'IOE Lớp 3 - Cấp Quận/Huyện (200 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 3 Cấp Quận/Huyện gồm 200 câu hỏi. Tăng cường dạng bài nghe và điền từ vào chỗ trống.',
    grade: 3,
    competitionLevel: 'district',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 80, grammar: 65, reading: 25, listening: 30 },
    difficultyDistribution: { 1: 50, 2: 90, 3: 50, 4: 10 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g3-province',
    title: 'IOE Lớp 3 - Cấp Tỉnh/TP & Quốc Gia (200 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 3 Cấp Tỉnh/Quốc Gia nâng cao. Phân loại học sinh giỏi với các bẫy ngữ pháp và từ vựng mở rộng.',
    grade: 3,
    competitionLevel: 'province',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 75, grammar: 70, reading: 25, listening: 30 },
    difficultyDistribution: { 1: 30, 2: 80, 3: 70, 4: 20 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },

  // ================= GRADE 4 (200 CÂU / 30 PHÚT) =================
  {
    id: 'bp-g4-school',
    title: 'IOE Lớp 4 - Cấp Trường (200 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 4 Cấp Trường chuẩn 200 câu / 30 phút. Thời gian, nghề nghiệp, ngày tháng, địa điểm.',
    grade: 4,
    competitionLevel: 'school',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 85, grammar: 65, reading: 25, listening: 25 },
    difficultyDistribution: { 1: 60, 2: 85, 3: 45, 4: 10 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g4-district',
    title: 'IOE Lớp 4 - Cấp Quận/Huyện (200 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 4 Cấp Huyện. Luyện tập thì hiện tại đơn, hiện tại tiếp diễn, giới từ chỉ nơi chốn và thời gian.',
    grade: 4,
    competitionLevel: 'district',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 80, grammar: 70, reading: 25, listening: 25 },
    difficultyDistribution: { 1: 45, 2: 85, 3: 55, 4: 15 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g4-province',
    title: 'IOE Lớp 4 - Cấp Tỉnh & Quốc Gia (200 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 4 Cấp Tỉnh/Quốc Gia nâng cao bám sát cấu trúc đề thi chính thức Bộ GD&ĐT.',
    grade: 4,
    competitionLevel: 'province',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 75, grammar: 75, reading: 25, listening: 25 },
    difficultyDistribution: { 1: 25, 2: 75, 3: 75, 4: 25 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },

  // ================= GRADE 5 (200 CÂU / 30 PHÚT) =================
  {
    id: 'bp-g5-school',
    title: 'IOE Lớp 5 - Cấp Trường (200 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 5 Cấp Trường chuẩn 200 câu trong 30 phút. Tổng hợp toàn bộ kiến thức tiếng Anh cấp Tiểu học.',
    grade: 5,
    competitionLevel: 'school',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 80, grammar: 60, reading: 30, listening: 30 },
    difficultyDistribution: { 1: 50, 2: 80, 3: 50, 4: 20 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g5-district',
    title: 'IOE Lớp 5 - Cấp Quận/Huyện (200 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 5 Cấp Quận/Huyện chuẩn 200 câu / 30 phút. Tăng cường bài đọc hiểu và dạng sắp xếp từ thành câu.',
    grade: 5,
    competitionLevel: 'district',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 75, grammar: 65, reading: 30, listening: 30 },
    difficultyDistribution: { 1: 35, 2: 75, 3: 65, 4: 25 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g5-province',
    title: 'IOE Lớp 5 - Cấp Tỉnh/Thành Phố (200 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 5 Cấp Tỉnh với các câu hỏi phân loại học sinh giỏi, thì quá khứ đơn, tương lai đơn và câu so sánh.',
    grade: 5,
    competitionLevel: 'province',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 70, grammar: 70, reading: 30, listening: 30 },
    difficultyDistribution: { 1: 20, 2: 70, 3: 75, 4: 35 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g5-national',
    title: 'IOE Lớp 5 - Cấp Toàn Quốc (200 câu / 30 phút)',
    description: 'Đề thi IOE Lớp 5 Vòng Toàn Quốc (National Round). Đỉnh cao phản xạ 200 câu trong 30 phút với độ khó cao nhất.',
    grade: 5,
    competitionLevel: 'national',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 65, grammar: 75, reading: 30, listening: 30 },
    difficultyDistribution: { 1: 15, 2: 55, 3: 80, 4: 40, 5: 10 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },

  // ================= GRADE 6 (200 CÂU / 30 PHÚT) =================
  {
    id: 'bp-g6-school',
    title: 'IOE Lớp 6 - Cấp Trường (200 câu / 30 phút)',
    description: 'Đề thi IOE THCS Khối 6 Cấp Trường. Ngữ pháp thì hiện tại đơn, hiện tại tiếp diễn, tính từ sở hữu, danh từ đếm được & không đếm được.',
    grade: 6,
    competitionLevel: 'school',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 75, grammar: 65, reading: 30, listening: 30 },
    difficultyDistribution: { 1: 40, 2: 80, 3: 60, 4: 20 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g6-district',
    title: 'IOE Lớp 6 - Cấp Huyện/Tỉnh (200 câu / 30 phút)',
    description: 'Đề thi IOE Khối 6 Cấp Huyện/Tỉnh. Tăng cường câu so sánh hơn, so sánh nhất, modal verbs và bài đọc văn hóa.',
    grade: 6,
    competitionLevel: 'district',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 70, grammar: 70, reading: 30, listening: 30 },
    difficultyDistribution: { 1: 25, 2: 70, 3: 75, 4: 30 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },

  // ================= GRADE 7 (200 CÂU / 30 PHÚT) =================
  {
    id: 'bp-g7-school',
    title: 'IOE Lớp 7 - Cấp Trường (200 câu / 30 phút)',
    description: 'Đề thi IOE Khối 7 Cấp Trường 200 câu / 30 phút. Chủ điểm sở thích, sức khỏe, cộng đồng, âm nhạc và nghệ thuật.',
    grade: 7,
    competitionLevel: 'school',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 70, grammar: 70, reading: 30, listening: 30 },
    difficultyDistribution: { 1: 35, 2: 75, 3: 65, 4: 25 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g7-province',
    title: 'IOE Lớp 7 - Cấp Tỉnh & Toàn Quốc (200 câu / 30 phút)',
    description: 'Đề thi IOE Khối 7 Cấp Tỉnh/Quốc Gia. Thì quá khứ đơn, used to, câu bị động cơ bản, liên từ although/because.',
    grade: 7,
    competitionLevel: 'province',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 65, grammar: 75, reading: 30, listening: 30 },
    difficultyDistribution: { 1: 20, 2: 65, 3: 80, 4: 35 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },

  // ================= GRADE 8 (200 CÂU / 30 PHÚT) =================
  {
    id: 'bp-g8-school',
    title: 'IOE Lớp 8 - Cấp Trường (200 câu / 30 phút)',
    description: 'Đề thi IOE Khối 8 Cấp Trường. Câu điều kiện loại 1, câu bị động, thì quá khứ tiếp diễn, câu tường thuật.',
    grade: 8,
    competitionLevel: 'school',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 70, grammar: 70, reading: 30, listening: 30 },
    difficultyDistribution: { 1: 30, 2: 70, 3: 70, 4: 30 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g8-province',
    title: 'IOE Lớp 8 - Cấp Tỉnh & Toàn Quốc (200 câu / 30 phút)',
    description: 'Đề thi IOE Khối 8 Cấp Tỉnh/Quốc Gia nâng cao với các cấu trúc ngữ pháp phức hợp và từ đồng nghĩa/trái nghĩa.',
    grade: 8,
    competitionLevel: 'province',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 65, grammar: 75, reading: 30, listening: 30 },
    difficultyDistribution: { 1: 15, 2: 60, 3: 85, 4: 40 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },

  // ================= GRADE 9 (200 CÂU / 30 PHÚT) =================
  {
    id: 'bp-g9-school',
    title: 'IOE Lớp 9 - Cấp Trường (200 câu / 30 phút)',
    description: 'Đề thi IOE Khối 9 Cấp Trường chuẩn 200 câu / 30 phút. Ôn luyện tổng thể kiến thức THCS và định hướng vào Lớp 10.',
    grade: 9,
    competitionLevel: 'school',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 65, grammar: 75, reading: 30, listening: 30 },
    difficultyDistribution: { 1: 25, 2: 65, 3: 75, 4: 35 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g9-district',
    title: 'IOE Lớp 9 - Cấp Quận/Huyện (200 câu / 30 phút)',
    description: 'Đề thi IOE Khối 9 Cấp Huyện. Câu ước Wish, câu gián tiếp, mệnh đề quan hệ (Relative Clauses), phrasal verbs.',
    grade: 9,
    competitionLevel: 'district',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 60, grammar: 80, reading: 30, listening: 30 },
    difficultyDistribution: { 1: 15, 2: 55, 3: 85, 4: 45 },
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  {
    id: 'bp-g9-national',
    title: 'IOE Lớp 9 - Cấp Toàn Quốc (200 câu / 30 phút)',
    description: 'Đề thi IOE Khối 9 Vòng Toàn Quốc (National Final). Chuẩn đề thi học sinh giỏi quốc gia và luyện thi vào trường THPT Chuyên.',
    grade: 9,
    competitionLevel: 'national',
    isOfficialMock: true,
    durationMinutes: 30,
    totalQuestions: 200,
    skillDistribution: { vocabulary: 55, grammar: 80, reading: 35, listening: 30 },
    difficultyDistribution: { 1: 10, 2: 45, 3: 85, 4: 50, 5: 10 },
    createdAt: '2026-08-15T08:00:00.000Z'
  }
];
