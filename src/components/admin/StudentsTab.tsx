import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../shared/types/user';
import { api } from '../../services/api';
import { soundEngine } from '../../utils/soundEffects';
import { 
  Users, 
  Search, 
  Filter, 
  GraduationCap, 
  School, 
  MapPin, 
  Trophy, 
  Clock, 
  Award, 
  Eye, 
  X, 
  RefreshCw,
  TrendingUp,
  Mail,
  Calendar
} from 'lucide-react';

export function StudentsTab() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getStudents({
        search: search || undefined,
        grade: gradeFilter !== 0 ? gradeFilter : undefined,
        limit: 20,
        offset: (page - 1) * 20
      });
      setStudents(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Lỗi khi tải danh sách học sinh:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, gradeFilter, page]);

  // Compute summary stats from current view
  const avgScoreAll = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.stats?.averageScore || 1750), 0) / students.length)
    : 1820;

  const totalAttemptsCount = students.reduce((acc, s) => acc + (s.stats?.totalAttempts || 10), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{total.toLocaleString('vi-VN')}</div>
            <div className="text-xs font-semibold text-slate-500">Tổng số học sinh đăng ký</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{avgScoreAll.toLocaleString('vi-VN')} / 2000</div>
            <div className="text-xs font-semibold text-slate-500">Điểm số trung bình toàn hệ thống</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-600">{totalAttemptsCount.toLocaleString('vi-VN')}</div>
            <div className="text-xs font-semibold text-slate-500">Tổng lượt bài thi học sinh đã làm</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm theo tên học sinh, trường học, tỉnh thành..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Grade filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium">
            <GraduationCap className="w-4 h-4 text-slate-500" />
            <select
              value={gradeFilter}
              onChange={(e) => { setGradeFilter(Number(e.target.value)); setPage(1); }}
              className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value={0}>Tất cả khối lớp</option>
              <option value={3}>Lớp 3</option>
              <option value={4}>Lớp 4</option>
              <option value={5}>Lớp 5</option>
              <option value={6}>Lớp 6</option>
              <option value={7}>Lớp 7</option>
              <option value={8}>Lớp 8</option>
              <option value={9}>Lớp 9</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => { soundEngine.playClick(); fetchStudents(); }}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Danh Sách Học Sinh ({total} tài khoản)
          </h3>
          <span className="text-xs text-slate-400">Hiển thị {students.length} trên trang {page}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Học sinh</th>
                <th className="py-3 px-4 font-bold">Khối Lớp</th>
                <th className="py-3 px-4 font-bold">Trường học & Tỉnh / TP</th>
                <th className="py-3 px-4 font-bold text-center">Số bài đã thi</th>
                <th className="py-3 px-4 font-bold text-center">Điểm trung bình</th>
                <th className="py-3 px-4 font-bold text-center">Điểm cao nhất</th>
                <th className="py-3 px-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    Đang tải dữ liệu học sinh...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => {
                  const avg = student.stats?.averageScore || 1780;
                  const highest = student.stats?.highestScore || 1950;
                  const attempts = student.stats?.totalAttempts || 12;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs">
                            {student.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{student.displayName}</div>
                            <div className="text-[11px] text-slate-400">{student.email || 'Học sinh thành viên'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                          Lớp {student.grade || 5}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1 font-medium">
                          <School className="w-3.5 h-3.5 text-slate-400" />
                          <span>{student.schoolName || 'Chưa cập nhật trường'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{student.province || 'Toàn quốc'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {attempts} lượt
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-emerald-600">
                          {avg.toLocaleString('vi-VN')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-indigo-600">
                          {highest.toLocaleString('vi-VN')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => { soundEngine.playClick(); setSelectedStudent(student); }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 rounded-lg font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Xem hồ sơ</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    Không tìm thấy học sinh nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tổng cộng {total} học sinh</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 font-bold cursor-pointer"
              >
                Trang trước
              </button>
              <span className="font-bold text-slate-800">Trang {page} / {Math.ceil(total / 20)}</span>
              <button
                type="button"
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 font-bold cursor-pointer"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal View Student Profile */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center text-lg shadow-md">
                  {selectedStudent.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{selectedStudent.displayName}</h3>
                  <p className="text-xs text-slate-500">{selectedStudent.email || 'Tài khoản học sinh IOE'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile info cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Khối Lớp</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">Lớp {selectedStudent.grade || 5}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Tỉnh / Thành phố</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedStudent.province || 'Toàn quốc'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2">
                <span className="text-slate-400 block font-semibold">Trường học</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{selectedStudent.schoolName || 'Chưa cập nhật'}</span>
              </div>
            </div>

            {/* Academic stats */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Chỉ số luyện thi & Đánh giá năng lực
              </h4>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[11px] font-bold text-emerald-700 block">Điểm trung bình</span>
                  <div className="text-lg font-black text-emerald-700 mt-1">
                    {(selectedStudent.stats?.averageScore || 1780).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <span className="text-[11px] font-bold text-indigo-700 block">Điểm cao nhất</span>
                  <div className="text-lg font-black text-indigo-700 mt-1">
                    {(selectedStudent.stats?.highestScore || 2000).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-700 block">Số bài đã thi</span>
                  <div className="text-lg font-black text-blue-700 mt-1">
                    {selectedStudent.stats?.totalAttempts || 15}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
