import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile } from './shared/types/user';
import { ExamBlueprint } from './shared/types/ioe';
import { api } from './services/api';
import { PracticeHubView } from './components/views/PracticeHubView';
import { MockExamHubView } from './components/views/MockExamHubView';
import { ExamArenaView } from './components/views/ExamArenaView';
import { ExamReviewView } from './components/views/ExamReviewView';
import { LeaderboardView } from './components/views/LeaderboardView';
import { HistoryView } from './components/views/HistoryView';
import { AdminTeacherDashboardView } from './components/views/AdminTeacherDashboardView';
import { TopExamStudentsWidget } from './components/widgets/TopExamStudentsWidget';
import { 
  GraduationCap, 
  Trophy, 
  BookOpen, 
  History as HistoryIcon, 
  Layers, 
  User, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Shield,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { soundEngine } from './utils/soundEffects';

type AppTab = 'practice' | 'mock_exam' | 'leaderboard' | 'history' | 'admin_dashboard';

export default function App() {
  // Current active main tab
  const [activeTab, setActiveTab] = useState<AppTab>('practice');

  // Preview student mode for teachers/admins
  const [previewStudentMode, setPreviewStudentMode] = useState(false);

  // User Profile / Role Simulation
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'student-demo-1',
    displayName: 'Nguyễn Minh Anh',
    role: 'student',
    grade: 5,
    schoolName: 'TH Nguyễn Du',
    province: 'Hà Nội',
    createdAt: new Date().toISOString()
  });

  // Active Exam state (if currently taking test)
  const [activeExamParams, setActiveExamParams] = useState<any | null>(null);

  // Past review state
  const [pastReviewData, setPastReviewData] = useState<any | null>(null);

  // Update API service with current user credentials
  useEffect(() => {
    if (currentUser.role === 'teacher') {
      api.setAuthToken('demo-teacher-token');
    } else if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
      api.setAuthToken('demo-admin-token');
    } else {
      api.setAuthToken('demo-student-token');
      api.setGuestUser({
        id: currentUser.id,
        name: currentUser.displayName,
        grade: currentUser.grade
      });
    }
  }, [currentUser]);

  // Handle role switch - Auto classifies view based on role
  const handleRoleChange = (role: UserRole) => {
    soundEngine.playClick();
    if (role === 'teacher') {
      setCurrentUser({
        id: 'teacher-demo-1',
        displayName: 'Cô Hoàng Thu Thảo',
        role: 'teacher',
        grade: 5,
        schoolName: 'TH Vinschool Times City',
        createdAt: new Date().toISOString()
      });
      // Teacher lands directly in admin dashboard
      setPreviewStudentMode(false);
      setActiveTab('admin_dashboard');
    } else if (role === 'admin' || role === 'super_admin') {
      setCurrentUser({
        id: 'admin-1',
        displayName: 'Ban Quản Trị IOE',
        role: 'super_admin',
        grade: 5,
        schoolName: 'Hội đồng Khảo thí IOE',
        createdAt: new Date().toISOString()
      });
      // Admin lands directly in admin dashboard
      setPreviewStudentMode(false);
      setActiveTab('admin_dashboard');
    } else {
      setCurrentUser({
        id: 'student-demo-1',
        displayName: 'Nguyễn Minh Anh',
        role: 'student',
        grade: 5,
        schoolName: 'TH Nguyễn Du',
        createdAt: new Date().toISOString()
      });
      // Student lands on public external interface
      setPreviewStudentMode(false);
      setActiveTab('practice');
    }
  };

  const isStaff = currentUser.role === 'teacher' || currentUser.role === 'admin' || currentUser.role === 'super_admin';

  // Start Exam from Practice Hub
  const handleStartPractice = (params: any) => {
    setPastReviewData(null);
    setActiveExamParams({
      ...params,
      mode: 'practice'
    });
  };

  // Start Exam from Mock Blueprint
  const handleStartMockExam = (bp: ExamBlueprint) => {
    setPastReviewData(null);
    setActiveExamParams({
      blueprintId: bp.id,
      grade: bp.grade,
      mode: 'mock_exam',
      count: bp.totalQuestions,
      gameSkin: 'standard'
    });
  };

  // Load Past Exam Review
  const handleReviewPastAttempt = async (attemptId: string) => {
    try {
      const review = await api.getAttemptReview(attemptId);
      setPastReviewData(review);
    } catch (err: any) {
      alert('Không thể xem lại bài thi: ' + err.message);
    }
  };

  // If in active exam mode, show ExamArenaView
  if (activeExamParams) {
    return (
      <ExamArenaView
        prepareParams={activeExamParams}
        onBackToHome={() => setActiveExamParams(null)}
      />
    );
  }

  // If viewing past review
  if (pastReviewData) {
    return (
      <div className="min-h-screen bg-slate-100 py-8">
        <ExamReviewView
          attemptSummary={pastReviewData}
          onBackToHome={() => setPastReviewData(null)}
          onRetake={() => {
            setPastReviewData(null);
            setActiveExamParams({
              grade: pastReviewData.grade || 5,
              mode: pastReviewData.mode || 'practice',
              count: 20
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Preview Mode Banner for Staff */}
      {isStaff && previewStudentMode && (
        <div className="bg-indigo-900 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md z-50">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>
              Chế độ xem trước giao diện Học sinh (Đang đăng nhập với vai trò: {currentUser.role === 'teacher' ? 'Giáo viên' : 'Quản trị viên'})
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setPreviewStudentMode(false);
              setActiveTab('admin_dashboard');
            }}
            className="bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1 rounded-lg font-black transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Bảng Quản Trị</span>
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => {
              if (isStaff && !previewStudentMode) {
                setActiveTab('admin_dashboard');
              } else {
                setActiveTab('practice');
              }
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-lg md:text-xl text-slate-900 tracking-tight">IOE Master</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">2026</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Luyện thi tiếng Anh trực tuyến chuẩn Quốc Gia</p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) - No Admin button; auto-switches based on role */}
          {(!isStaff || previewStudentMode) ? (
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => { soundEngine.playClick(); setActiveTab('practice'); }}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer
                  ${activeTab === 'practice' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}
                `}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Luyện tập</span>
              </button>

              <button
                type="button"
                onClick={() => { soundEngine.playClick(); setActiveTab('mock_exam'); }}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer
                  ${activeTab === 'mock_exam' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}
                `}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Thi thử</span>
              </button>

              <button
                type="button"
                onClick={() => { soundEngine.playClick(); setActiveTab('leaderboard'); }}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer
                  ${activeTab === 'leaderboard' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}
                `}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Xếp hạng</span>
              </button>

              <button
                type="button"
                onClick={() => { soundEngine.playClick(); setActiveTab('history'); }}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer
                  ${activeTab === 'history' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}
                `}
              >
                <HistoryIcon className="w-3.5 h-3.5" />
                <span>Lịch sử</span>
              </button>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
                Bảng Quản Trị & Khảo Thí
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setPreviewStudentMode(true);
                  setActiveTab('practice');
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem giao diện Học sinh</span>
              </button>
            </div>
          )}

          {/* User Profile & Role Switcher */}
          <div className="flex items-center space-x-2">
            {/* Quick Role Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer
                  ${currentUser.role === 'student' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}
                `}
                title="Đổi sang vai trò Học sinh (giao diện bên ngoài)"
              >
                Học sinh
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('teacher')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer
                  ${currentUser.role === 'teacher' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}
                `}
                title="Đổi sang vai trò Giáo viên (vào thẳng bảng quản trị)"
              >
                Giáo viên
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer
                  ${currentUser.role === 'super_admin' || currentUser.role === 'admin' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}
                `}
                title="Đổi sang vai trò Super Admin (vào thẳng bảng quản trị)"
              >
                Admin
              </button>
            </div>

            {/* User Avatar */}
            <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser.displayName.charAt(0)}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <div className="text-xs font-bold text-slate-800">{currentUser.displayName}</div>
                <div className="text-[10px] text-slate-500">
                  {currentUser.role === 'teacher' ? 'Giáo viên' : currentUser.role === 'super_admin' || currentUser.role === 'admin' ? 'Super Admin' : `Lớp ${currentUser.grade} • ${currentUser.schoolName || 'TH'}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs - visible only when student or previewing student */}
        {(!isStaff || previewStudentMode) && (
          <div className="md:hidden flex items-center justify-around border-t border-slate-200 px-2 py-1.5 bg-slate-50 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('practice')}
              className={`px-2.5 py-1.5 rounded-lg ${activeTab === 'practice' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'}`}
            >
              Luyện tập
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mock_exam')}
              className={`px-2.5 py-1.5 rounded-lg ${activeTab === 'mock_exam' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600'}`}
            >
              Thi thử
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className={`px-2.5 py-1.5 rounded-lg ${activeTab === 'leaderboard' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'}`}
            >
              Xếp hạng
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-2.5 py-1.5 rounded-lg ${activeTab === 'history' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'}`}
            >
              Lịch sử
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {['practice', 'mock_exam', 'leaderboard', 'history'].includes(activeTab) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left Main View */}
              <div className="flex-1 min-w-0 w-full">
                {activeTab === 'practice' && (
                  <PracticeHubView
                    currentGrade={currentUser.grade}
                    onStartPractice={handleStartPractice}
                  />
                )}

                {activeTab === 'mock_exam' && (
                  <MockExamHubView
                    currentGrade={currentUser.grade}
                    onStartExam={handleStartMockExam}
                  />
                )}

                {activeTab === 'leaderboard' && <LeaderboardView />}

                {activeTab === 'history' && (
                  <HistoryView onReviewPastAttempt={handleReviewPastAttempt} />
                )}
              </div>

              {/* Right Column: Top 10 học sinh thi thử block (always present on practice, mock_exam, leaderboard, history) */}
              <aside className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-24">
                <TopExamStudentsWidget
                  currentGrade={currentUser.grade}
                  onNavigateToLeaderboard={() => {
                    soundEngine.playClick();
                    setActiveTab('leaderboard');
                  }}
                />
              </aside>
            </div>
          </div>
        )}

        {activeTab === 'admin_dashboard' && isStaff && (
          <AdminTeacherDashboardView 
            currentUser={currentUser} 
            onNavigateToStudentView={() => {
              setPreviewStudentMode(true);
              setActiveTab('practice');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">IOE Master — Nền tảng Luyện thi Tiếng Anh Trực tuyến</p>
        <p>Phục vụ miễn phí học sinh và giáo viên từ Lớp 3 đến Lớp 12 trên toàn quốc.</p>
      </footer>
    </div>
  );
}
