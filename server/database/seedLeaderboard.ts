import { LeaderboardEntry } from '../../src/shared/types/ioe.js';

export const INITIAL_SEED_LEADERBOARD: Array<{
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  schoolName: string;
  grade: number;
  round: number;
  competitionLevel: 'national' | 'province' | 'district' | 'school';
  score: number;
  durationSeconds: number;
  accuracyRate: number;
  recordedAt: string;
}> = [
  // --- CẤP TOÀN QUỐC (NATIONAL) --- (Matching the user's screenshot)
  {
    id: 'lb-nat-1',
    userId: 'u-nat-1',
    userName: 'Đặng Minh Khôi',
    schoolName: 'TH Chu Văn An • Hà Nội',
    grade: 3,
    round: 4,
    competitionLevel: 'national',
    score: 33520,
    durationSeconds: 22510, // 6 giờ 15 phút 10 giây
    accuracyRate: 99.2,
    recordedAt: '2026-09-02T10:15:00.000Z'
  },
  {
    id: 'lb-nat-2',
    userId: 'u-nat-2',
    userName: 'Trần Bảo Nam',
    schoolName: 'TH Kim Đồng • Đà Nẵng',
    grade: 3,
    round: 4,
    competitionLevel: 'national',
    score: 32400,
    durationSeconds: 24618, // 6 giờ 50 phút 18 giây
    accuracyRate: 98.6,
    recordedAt: '2026-09-02T11:00:00.000Z'
  },
  {
    id: 'lb-nat-3',
    userId: 'u-nat-3',
    userName: 'Hà Tố Vũ',
    schoolName: 'TH Lê Quý Đôn • TP. HCM',
    grade: 3,
    round: 4,
    competitionLevel: 'national',
    score: 31830,
    durationSeconds: 27033, // 7 giờ 30 phút 33 giây
    accuracyRate: 98.1,
    recordedAt: '2026-09-02T11:20:00.000Z'
  },
  {
    id: 'lb-nat-4',
    userId: 'u-nat-4',
    userName: 'Nguyễn Gia Bảo',
    schoolName: 'TH Vinschool Times City • Hà Nội',
    grade: 3,
    round: 4,
    competitionLevel: 'national',
    score: 29260,
    durationSeconds: 11332, // 3 giờ 8 phút 52 giây
    accuracyRate: 97.4,
    recordedAt: '2026-09-02T14:10:00.000Z'
  },
  {
    id: 'lb-nat-5',
    userId: 'u-nat-5',
    userName: 'Kiều Thị Ngọc Ánh',
    schoolName: 'TH Nam Thành Công • Hà Nội',
    grade: 3,
    round: 4,
    competitionLevel: 'national',
    score: 27070,
    durationSeconds: 27974, // 7 giờ 46 phút 14 giây
    accuracyRate: 96.8,
    recordedAt: '2026-09-02T15:00:00.000Z'
  },
  {
    id: 'lb-nat-6',
    userId: 'u-nat-6',
    userName: 'Hoàng Vy An',
    schoolName: 'TH Archimedes Academy • Hà Nội',
    grade: 3,
    round: 4,
    competitionLevel: 'national',
    score: 27010,
    durationSeconds: 14601, // 4 giờ 3 phút 21 giây
    accuracyRate: 96.5,
    recordedAt: '2026-09-02T15:30:00.000Z'
  },
  {
    id: 'lb-nat-7',
    userId: 'u-nat-7',
    userName: 'Lê Nguyễn Thiên Tường',
    schoolName: 'TH Thực Nghiệm • Hà Nội',
    grade: 3,
    round: 4,
    competitionLevel: 'national',
    score: 24950,
    durationSeconds: 20622, // 5 giờ 43 phút 42 giây
    accuracyRate: 95.8,
    recordedAt: '2026-09-02T16:00:00.000Z'
  },
  {
    id: 'lb-nat-8',
    userId: 'u-nat-8',
    userName: 'Phạm Lê Phương Trinh',
    schoolName: 'TH Đoàn Thị Điểm • Hà Nội',
    grade: 3,
    round: 4,
    competitionLevel: 'national',
    score: 24380,
    durationSeconds: 16283, // 4 giờ 31 phút 23 giây
    accuracyRate: 95.2,
    recordedAt: '2026-09-02T16:30:00.000Z'
  },
  {
    id: 'lb-nat-9',
    userId: 'u-nat-9',
    userName: 'Phan Nguyễn Minh Châu',
    schoolName: 'TH Thăng Long • Hà Nội',
    grade: 3,
    round: 4,
    competitionLevel: 'national',
    score: 24220,
    durationSeconds: 11849, // 3 giờ 17 phút 29 giây
    accuracyRate: 94.9,
    recordedAt: '2026-09-02T17:00:00.000Z'
  },
  {
    id: 'lb-nat-10',
    userId: 'u-nat-10',
    userName: 'Nguyễn Trần Linh Đan',
    schoolName: 'TH Dịch Vọng A • Hà Nội',
    grade: 3,
    round: 4,
    competitionLevel: 'national',
    score: 23940,
    durationSeconds: 7785, // 2 giờ 9 phút 45 giây
    accuracyRate: 94.5,
    recordedAt: '2026-09-02T17:30:00.000Z'
  },

  // --- CẤP TỈNH/THÀNH PHỐ (PROVINCE) ---
  {
    id: 'lb-prv-1',
    userId: 'u-prv-1',
    userName: 'Nguyễn Minh Anh',
    schoolName: 'TH Chu Văn An • Hà Nội',
    grade: 3,
    round: 3,
    competitionLevel: 'province',
    score: 30120,
    durationSeconds: 15420, // 4 giờ 17 phút
    accuracyRate: 98.5,
    recordedAt: '2026-09-01T09:00:00.000Z'
  },
  {
    id: 'lb-prv-2',
    userId: 'u-prv-2',
    userName: 'Vũ Gia Huy',
    schoolName: 'TH Nguyễn Du • TP. Hồ Chí Minh',
    grade: 3,
    round: 3,
    competitionLevel: 'province',
    score: 29850,
    durationSeconds: 18230,
    accuracyRate: 97.9,
    recordedAt: '2026-09-01T09:30:00.000Z'
  },
  {
    id: 'lb-prv-3',
    userId: 'u-prv-3',
    userName: 'Lê Phương Linh',
    schoolName: 'TH Lê Quý Đôn • Đà Nẵng',
    grade: 3,
    round: 3,
    competitionLevel: 'province',
    score: 28940,
    durationSeconds: 14500,
    accuracyRate: 97.2,
    recordedAt: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'lb-prv-4',
    userId: 'u-prv-4',
    userName: 'Bùi Quang Dũng',
    schoolName: 'TH Nam Thành Công • Hà Nội',
    grade: 3,
    round: 3,
    competitionLevel: 'province',
    score: 27600,
    durationSeconds: 16800,
    accuracyRate: 96.5,
    recordedAt: '2026-09-01T10:30:00.000Z'
  },
  {
    id: 'lb-prv-5',
    userId: 'u-prv-5',
    userName: 'Trần Mai Chi',
    schoolName: 'TH Phan Chu Trinh • Hải Phòng',
    grade: 3,
    round: 3,
    competitionLevel: 'province',
    score: 26850,
    durationSeconds: 13200,
    accuracyRate: 96.1,
    recordedAt: '2026-09-01T11:00:00.000Z'
  },
  {
    id: 'lb-prv-6',
    userId: 'u-prv-6',
    userName: 'Hoàng Quốc Bảo',
    schoolName: 'TH Trần Quốc Toản • Cần Thơ',
    grade: 3,
    round: 3,
    competitionLevel: 'province',
    score: 25920,
    durationSeconds: 12400,
    accuracyRate: 95.8,
    recordedAt: '2026-09-01T11:30:00.000Z'
  },
  {
    id: 'lb-prv-7',
    userId: 'u-prv-7',
    userName: 'Đỗ Minh Khang',
    schoolName: 'TH Vinschool Central Park • TP. HCM',
    grade: 3,
    round: 3,
    competitionLevel: 'province',
    score: 25100,
    durationSeconds: 10800,
    accuracyRate: 95.2,
    recordedAt: '2026-09-01T14:00:00.000Z'
  },
  {
    id: 'lb-prv-8',
    userId: 'u-prv-8',
    userName: 'Dương Ngọc Diệp',
    schoolName: 'TH Nguyễn Thái Học • Quảng Ninh',
    grade: 3,
    round: 3,
    competitionLevel: 'province',
    score: 24500,
    durationSeconds: 11950,
    accuracyRate: 94.8,
    recordedAt: '2026-09-01T14:30:00.000Z'
  },
  {
    id: 'lb-prv-9',
    userId: 'u-prv-9',
    userName: 'Đinh Tuấn Kiệt',
    schoolName: 'TH Đinh Tiên Hoàng • Nghệ An',
    grade: 3,
    round: 3,
    competitionLevel: 'province',
    score: 23820,
    durationSeconds: 9400,
    accuracyRate: 94.2,
    recordedAt: '2026-09-01T15:00:00.000Z'
  },
  {
    id: 'lb-prv-10',
    userId: 'u-prv-10',
    userName: 'Trịnh Thảo Nhi',
    schoolName: 'TH Lê Hồng Phong • Bình Dương',
    grade: 3,
    round: 3,
    competitionLevel: 'province',
    score: 23150,
    durationSeconds: 8800,
    accuracyRate: 93.9,
    recordedAt: '2026-09-01T15:30:00.000Z'
  },

  // --- CẤP XÃ/PHƯỜNG/ĐẶC KHU (DISTRICT) ---
  {
    id: 'lb-dst-1',
    userId: 'u-dst-1',
    userName: 'Phạm Khánh Vy',
    schoolName: 'TH Nghĩa Tân • Q. Cầu Giấy',
    grade: 3,
    round: 2,
    competitionLevel: 'district',
    score: 28450,
    durationSeconds: 12400,
    accuracyRate: 97.8,
    recordedAt: '2026-08-30T08:00:00.000Z'
  },
  {
    id: 'lb-dst-2',
    userId: 'u-dst-2',
    userName: 'Vũ Đình Long',
    schoolName: 'TH Dịch Vọng • Q. Cầu Giấy',
    grade: 3,
    round: 2,
    competitionLevel: 'district',
    score: 27900,
    durationSeconds: 13100,
    accuracyRate: 97.1,
    recordedAt: '2026-08-30T08:30:00.000Z'
  },
  {
    id: 'lb-dst-3',
    userId: 'u-dst-3',
    userName: 'Nguyễn Hải Đăng',
    schoolName: 'TH Trung Hòa • Q. Cầu Giấy',
    grade: 3,
    round: 2,
    competitionLevel: 'district',
    score: 26820,
    durationSeconds: 11900,
    accuracyRate: 96.5,
    recordedAt: '2026-08-30T09:00:00.000Z'
  },
  {
    id: 'lb-dst-4',
    userId: 'u-dst-4',
    userName: 'Lương Bảo Châu',
    schoolName: 'TH Mai Dịch • Q. Cầu Giấy',
    grade: 3,
    round: 2,
    competitionLevel: 'district',
    score: 25750,
    durationSeconds: 10400,
    accuracyRate: 96.0,
    recordedAt: '2026-08-30T09:30:00.000Z'
  },
  {
    id: 'lb-dst-5',
    userId: 'u-dst-5',
    userName: 'Tạ Minh Đức',
    schoolName: 'TH Yên Hòa • Q. Cầu Giấy',
    grade: 3,
    round: 2,
    competitionLevel: 'district',
    score: 24980,
    durationSeconds: 9800,
    accuracyRate: 95.3,
    recordedAt: '2026-08-30T10:00:00.000Z'
  },
  {
    id: 'lb-dst-6',
    userId: 'u-dst-6',
    userName: 'Ngô Quỳnh Anh',
    schoolName: 'TH Nam Trung Yên • Q. Cầu Giấy',
    grade: 3,
    round: 2,
    competitionLevel: 'district',
    score: 24120,
    durationSeconds: 9200,
    accuracyRate: 94.7,
    recordedAt: '2026-08-30T10:30:00.000Z'
  },
  {
    id: 'lb-dst-7',
    userId: 'u-dst-7',
    userName: 'Đoàn Gia Hưng',
    schoolName: 'TH Quan Hoa • Q. Cầu Giấy',
    grade: 3,
    round: 2,
    competitionLevel: 'district',
    score: 23650,
    durationSeconds: 8900,
    accuracyRate: 94.2,
    recordedAt: '2026-08-30T11:00:00.000Z'
  },
  {
    id: 'lb-dst-8',
    userId: 'u-dst-8',
    userName: 'Chu Ngọc Hân',
    schoolName: 'TH Dịch Vọng B • Q. Cầu Giấy',
    grade: 3,
    round: 2,
    competitionLevel: 'district',
    score: 22900,
    durationSeconds: 8400,
    accuracyRate: 93.8,
    recordedAt: '2026-08-30T11:30:00.000Z'
  },
  {
    id: 'lb-dst-9',
    userId: 'u-dst-9',
    userName: 'Mai Tuấn Anh',
    schoolName: 'TH An Hòa • Q. Cầu Giấy',
    grade: 3,
    round: 2,
    competitionLevel: 'district',
    score: 22150,
    durationSeconds: 7900,
    accuracyRate: 93.1,
    recordedAt: '2026-08-30T14:00:00.000Z'
  },
  {
    id: 'lb-dst-10',
    userId: 'u-dst-10',
    userName: 'Lưu Bảo Ngọc',
    schoolName: 'TH Hermann Gmeiner • Q. Cầu Giấy',
    grade: 3,
    round: 2,
    competitionLevel: 'district',
    score: 21800,
    durationSeconds: 7500,
    accuracyRate: 92.5,
    recordedAt: '2026-08-30T14:30:00.000Z'
  },

  // --- CẤP TRƯỜNG (SCHOOL) ---
  {
    id: 'lb-sch-1',
    userId: 'u-sch-1',
    userName: 'Trần Đức Minh',
    schoolName: 'Lớp 3A1 • TH Chu Văn An',
    grade: 3,
    round: 1,
    competitionLevel: 'school',
    score: 25800,
    durationSeconds: 9600,
    accuracyRate: 97.0,
    recordedAt: '2026-08-28T08:00:00.000Z'
  },
  {
    id: 'lb-sch-2',
    userId: 'u-sch-2',
    userName: 'Đào Thu Phương',
    schoolName: 'Lớp 3A2 • TH Chu Văn An',
    grade: 3,
    round: 1,
    competitionLevel: 'school',
    score: 25120,
    durationSeconds: 9100,
    accuracyRate: 96.5,
    recordedAt: '2026-08-28T08:30:00.000Z'
  },
  {
    id: 'lb-sch-3',
    userId: 'u-sch-3',
    userName: 'Trương Quốc Anh',
    schoolName: 'Lớp 3A3 • TH Chu Văn An',
    grade: 3,
    round: 1,
    competitionLevel: 'school',
    score: 24650,
    durationSeconds: 8700,
    accuracyRate: 95.8,
    recordedAt: '2026-08-28T09:00:00.000Z'
  },
  {
    id: 'lb-sch-4',
    userId: 'u-sch-4',
    userName: 'Nguyễn Thu Trang',
    schoolName: 'Lớp 3A1 • TH Chu Văn An',
    grade: 3,
    round: 1,
    competitionLevel: 'school',
    score: 23900,
    durationSeconds: 8200,
    accuracyRate: 95.2,
    recordedAt: '2026-08-28T09:30:00.000Z'
  },
  {
    id: 'lb-sch-5',
    userId: 'u-sch-5',
    userName: 'Lê Minh Quang',
    schoolName: 'Lớp 3B2 • TH Chu Văn An',
    grade: 3,
    round: 1,
    competitionLevel: 'school',
    score: 23200,
    durationSeconds: 7900,
    accuracyRate: 94.6,
    recordedAt: '2026-08-28T10:00:00.000Z'
  },
  {
    id: 'lb-sch-6',
    userId: 'u-sch-6',
    userName: 'Hoàng Bích Ngọc',
    schoolName: 'Lớp 3A4 • TH Chu Văn An',
    grade: 3,
    round: 1,
    competitionLevel: 'school',
    score: 22750,
    durationSeconds: 7400,
    accuracyRate: 94.0,
    recordedAt: '2026-08-28T10:30:00.000Z'
  },
  {
    id: 'lb-sch-7',
    userId: 'u-sch-7',
    userName: 'Phạm Hoàng Nam',
    schoolName: 'Lớp 3B1 • TH Chu Văn An',
    grade: 3,
    round: 1,
    competitionLevel: 'school',
    score: 22100,
    durationSeconds: 7100,
    accuracyRate: 93.5,
    recordedAt: '2026-08-28T11:00:00.000Z'
  },
  {
    id: 'lb-sch-8',
    userId: 'u-sch-8',
    userName: 'Phan Gia Linh',
    schoolName: 'Lớp 3A2 • TH Chu Văn An',
    grade: 3,
    round: 1,
    competitionLevel: 'school',
    score: 21650,
    durationSeconds: 6800,
    accuracyRate: 92.8,
    recordedAt: '2026-08-28T14:00:00.000Z'
  },
  {
    id: 'lb-sch-9',
    userId: 'u-sch-9',
    userName: 'Vũ Thành Đạt',
    schoolName: 'Lớp 3B3 • TH Chu Văn An',
    grade: 3,
    round: 1,
    competitionLevel: 'school',
    score: 21050,
    durationSeconds: 6500,
    accuracyRate: 92.1,
    recordedAt: '2026-08-28T14:30:00.000Z'
  },
  {
    id: 'lb-sch-10',
    userId: 'u-sch-10',
    userName: 'Đặng Phương Anh',
    schoolName: 'Lớp 3A3 • TH Chu Văn An',
    grade: 3,
    round: 1,
    competitionLevel: 'school',
    score: 20500,
    durationSeconds: 6200,
    accuracyRate: 91.5,
    recordedAt: '2026-08-28T15:00:00.000Z'
  }
];
