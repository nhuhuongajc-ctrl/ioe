import React, { useState, useEffect } from 'react';
import { IOEQuestion, IOESkill, InteractionFamily } from '../../shared/types/ioe';
import { api } from '../../services/api';
import { 
  Sparkles, 
  Search, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Volume2, 
  Upload, 
  Download, 
  Filter,
  Layers,
  AlertCircle
} from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

export const QuestionFactoryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bank' | 'generator' | 'lexical' | 'import'>('bank');

  // Bank State
  const [questions, setQuestions] = useState<IOEQuestion[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [bankLoading, setBankLoading] = useState<boolean>(true);
  const [gradeFilter, setGradeFilter] = useState<number | undefined>(undefined);
  const [skillFilter, setSkillFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Generator State
  const [genGrade, setGenGrade] = useState<number>(5);
  const [genSkill, setGenSkill] = useState<IOESkill>('vocabulary');
  const [genTopic, setGenTopic] = useState<string>('School & Hobbies');
  const [genDifficulty, setGenDifficulty] = useState<number>(2);
  const [genFamily, setGenFamily] = useState<InteractionFamily>('choice');
  const [genKeywords, setGenKeywords] = useState<string>('');
  const [genCount, setGenCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [draftQuestions, setDraftQuestions] = useState<IOEQuestion[]>([]);

  // Lexical State
  const [lexicalWord, setLexicalWord] = useState<string>('environment');
  const [lexicalData, setLexicalData] = useState<any | null>(null);
  const [lexicalLoading, setLexicalLoading] = useState<boolean>(false);

  // Bulk Import State
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Load Bank Questions
  const loadQuestions = async () => {
    try {
      setBankLoading(true);
      const res = await api.getQuestions({
        grade: gradeFilter,
        skill: skillFilter || undefined,
        search: searchQuery || undefined,
        limit: 50
      });
      setQuestions(res.items);
      setTotalQuestions(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setBankLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [gradeFilter, skillFilter, searchQuery]);

  // Handle AI Generate
  const handleGenerateAIDrafts = async () => {
    try {
      setIsGenerating(true);
      soundEngine.playClick();
      const kw = genKeywords.split(',').map(k => k.trim()).filter(Boolean);
      const res = await api.generateAIDraftQuestions({
        grade: genGrade,
        skill: genSkill,
        topic: genTopic,
        count: genCount,
        difficulty: genDifficulty,
        interactionFamily: genFamily,
        keywords: kw
      });
      setDraftQuestions(res.items);
      loadQuestions();
    } catch (err: any) {
      alert('Lỗi sinh câu hỏi: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Approve Question
  const handleApprove = async (id: string) => {
    try {
      soundEngine.playCorrect();
      await api.approveQuestion(id);
      setDraftQuestions(prev => prev.filter(q => q.id !== id));
      loadQuestions();
    } catch (err: any) {
      alert('Lỗi duyệt: ' + err.message);
    }
  };

  // Handle Delete Question
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?')) return;
    try {
      soundEngine.playClick();
      await api.deleteQuestion(id);
      loadQuestions();
    } catch (err: any) {
      alert('Lỗi xóa câu hỏi: ' + err.message);
    }
  };

  // Handle Lexical Search
  const handleSearchLexical = async () => {
    if (!lexicalWord.trim()) return;
    try {
      setLexicalLoading(true);
      const res = await api.searchLexical(lexicalWord.trim());
      setLexicalData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLexicalLoading(false);
    }
  };

  // Handle Bulk Import
  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(importJsonText);
      const res = await fetch('/api/ioe/factory/import-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer demo-teacher-token' },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      if (data.success) {
        setImportStatus(`Đã nhập thành công ${data.count} câu hỏi vào ngân hàng.`);
        setImportJsonText('');
        loadQuestions();
      } else {
        setImportStatus(`Lỗi: ${data.message}`);
      }
    } catch (err: any) {
      setImportStatus('JSON không đúng định dạng: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Question Factory & Teacher Studio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Quản Lý & Soạn Thảo Đề Thi IOE
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Bộ công cụ kiểm định chất lượng, sinh câu hỏi tự động với Gemini và tra cứu từ vựng học thuật.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {[
            { id: 'bank', label: 'Ngân hàng câu hỏi', icon: BookOpen },
            { id: 'generator', label: 'AI Generator', icon: Sparkles },
            { id: 'lexical', label: 'Tra cứu Từ điển', icon: Search },
            { id: 'import', label: 'Nhập/Xuất JSON', icon: Upload }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap
                  ${activeTab === tab.id ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: BANK */}
      {activeTab === 'bank' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo nội dung câu hỏi, chủ đề..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <select
              value={gradeFilter || ''}
              onChange={e => setGradeFilter(e.target.value ? Number(e.target.value) : undefined)}
              className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="">Tất cả khối lớp</option>
              {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                <option key={g} value={g}>Khối {g}</option>
              ))}
            </select>

            <select
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
              className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="">Tất cả kỹ năng</option>
              <option value="vocabulary">Từ vựng (Vocabulary)</option>
              <option value="grammar">Ngữ pháp (Grammar)</option>
              <option value="reading">Đọc hiểu (Reading)</option>
              <option value="listening">Nghe hiểu (Listening)</option>
            </select>

            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Thêm câu hỏi với AI</span>
            </button>
          </div>

          {/* Table of questions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Tổng số: {totalQuestions} câu hỏi</span>
              <span>Trạng thái: Đã kiểm duyệt</span>
            </div>

            {bankLoading ? (
              <div className="p-8 text-center text-slate-400">Đang tải ngân hàng câu hỏi...</div>
            ) : questions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Không tìm thấy câu hỏi phù hợp.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded">
                          Lớp {q.grade}
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded capitalize">
                          {q.skill}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {q.interaction.family} / {q.interaction.subtype}
                        </span>
                        {q.qualityStatus === 'approved' ? (
                          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt
                          </span>
                        ) : (
                          <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Cần duyệt
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        {idx + 1}. {q.prompt}
                      </p>

                      {q.answer?.explanation && (
                        <p className="text-xs text-slate-600 line-clamp-1 italic">
                          Giải thích: {q.answer.explanation}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDelete(q.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI GENERATOR */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Thiết lập tạo câu hỏi AI</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp (Grade):</label>
                <select
                  value={genGrade}
                  onChange={e => setGenGrade(Number(e.target.value))}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kỹ năng (Skill):</label>
                <select
                  value={genSkill}
                  onChange={e => setGenSkill(e.target.value as any)}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="vocabulary">Từ vựng (Vocabulary)</option>
                  <option value="grammar">Ngữ pháp (Grammar)</option>
                  <option value="reading">Đọc hiểu (Reading)</option>
                  <option value="listening">Nghe hiểu (Listening)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dạng tương tác:</label>
                <select
                  value={genFamily}
                  onChange={e => setGenFamily(e.target.value as any)}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="choice">Trắc nghiệm chọn đáp án (Choice)</option>
                  <option value="text-entry">Điền từ khuyết / Chữ cái (Text Entry)</option>
                  <option value="ordering">Sắp xếp từ thành câu (Ordering)</option>
                  <option value="matching">Nối cặp tương ứng (Matching)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề (Topic):</label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={e => setGenTopic(e.target.value)}
                  placeholder="Ví dụ: My Family, Daily Routine, Past Tense..."
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Từ khóa mục tiêu (cách nhau bằng dấu phẩy):</label>
                <input
                  type="text"
                  value={genKeywords}
                  onChange={e => setGenKeywords(e.target.value)}
                  placeholder="Ví dụ: scissors, brush, library..."
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng câu muốn tạo:</label>
                <div className="flex gap-2">
                  {[1, 3, 5].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGenCount(c)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors
                        ${genCount === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'}
                      `}
                    >
                      {c} câu
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateAIDrafts}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Đang tạo câu hỏi với Gemini...' : 'Tạo bản thảo câu hỏi'}</span>
              </button>
            </div>
          </div>

          {/* Results / Drafts Review */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bản thảo câu hỏi vừa sinh ({draftQuestions.length} câu)
            </div>

            {draftQuestions.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                Chưa có bản thảo nào. Hãy thiết lập các thông số bên trái và bấm <strong>"Tạo bản thảo câu hỏi"</strong>.
              </div>
            ) : (
              draftQuestions.map((draft, idx) => (
                <div key={draft.id} className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md">
                      Bản thảo #{idx + 1} • Cần duyệt
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApprove(draft.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Duyệt vào Ngân hàng</span>
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {draft.prompt}
                  </h3>

                  {draft.options && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {draft.options.map(opt => (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-lg border font-medium ${
                            opt.id === draft.answer?.correctOptionId
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <strong>{opt.label}:</strong> {opt.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {draft.answer?.explanation && (
                    <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700">
                      <strong>Giải thích:</strong> {draft.answer.explanation}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LEXICAL EXPLORER */}
      {activeTab === 'lexical' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex gap-2">
              <input
                type="text"
                value={lexicalWord}
                onChange={e => setLexicalWord(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchLexical()}
                placeholder="Nhập từ tiếng Anh để tra cứu (ví dụ: environment, schedule, scissors)..."
                className="flex-1 text-base px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={handleSearchLexical}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl flex items-center space-x-1.5 shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>Tra cứu</span>
              </button>
            </div>
          </div>

          {lexicalData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dictionary & Phonetics */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 capitalize">
                    {lexicalData.word}
                  </h3>
                  {lexicalData.dictionary?.phonetic && (
                    <button
                      type="button"
                      onClick={() => soundEngine.speakWord(lexicalData.word)}
                      className="flex items-center space-x-1 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl font-bold hover:bg-indigo-100"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{lexicalData.dictionary.phonetic}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Định nghĩa học thuật:</div>
                  {lexicalData.dictionary?.meanings?.map((m: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-indigo-700 italic capitalize">{m.partOfSpeech}</span>
                      <p className="text-slate-800">{m.definitions?.[0]?.definition}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distractors & Synonyms */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Từ đồng nghĩa & Phương án gây nhiễu (Datamuse):
                </div>

                <div className="flex flex-wrap gap-2">
                  {lexicalData.datamuse?.map((item: any) => (
                    <span
                      key={item.word}
                      className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg"
                    >
                      {item.word}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Ví dụ từ Tatoeba:</div>
                  {lexicalData.tatoeba?.map((ex: any, idx: number) => (
                    <p key={idx} className="text-xs text-slate-700 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                      "{ex.text}"
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BULK IMPORT */}
      {activeTab === 'import' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Nhập hàng loạt câu hỏi từ file JSON</h3>
            <span className="text-xs text-slate-500">Định dạng IOE Question Schema v1</span>
          </div>

          <textarea
            rows={10}
            value={importJsonText}
            onChange={e => setImportJsonText(e.target.value)}
            placeholder='[ { "grade": 5, "skill": "vocabulary", "prompt": "She needs a ______ to cut paper.", "options": [...], "answer": { "correctOptionId": "opt-b", "explanation": "..." } } ]'
            className="w-full p-4 font-mono text-xs rounded-2xl border border-slate-300 focus:outline-none focus:border-indigo-600 bg-slate-50"
          />

          {importStatus && (
            <div className="p-3 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200">
              {importStatus}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleBulkImport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-sm"
            >
              Nhập dữ liệu vào Ngân hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
