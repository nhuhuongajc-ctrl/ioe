export const SQLITE_SCHEMA_DDL = `
-- ==========================================================
-- IOE MASTER ENGINE: SQLITE DDL SCHEMA (WAL MODE ENABLED)
-- Safe, Idempotent, and Additive
-- ==========================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  grade INTEGER NOT NULL DEFAULT 5,
  school_name TEXT,
  province TEXT,
  avatar_url TEXT,
  stats_json TEXT,
  created_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  grade INTEGER NOT NULL,
  cefr_level TEXT,
  skill TEXT NOT NULL,
  topic TEXT,
  difficulty INTEGER NOT NULL DEFAULT 2,
  interaction_family TEXT NOT NULL,
  interaction_subtype TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options_json TEXT,
  answer_json TEXT NOT NULL,
  tokens_json TEXT,
  matching_pairs_json TEXT,
  missing_letter_pattern TEXT,
  passage TEXT,
  audio_url TEXT,
  image_url TEXT,
  source_json TEXT,
  quality_status TEXT NOT NULL DEFAULT 'approved',
  statistics_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_blueprints (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  grade INTEGER NOT NULL,
  competition_level TEXT NOT NULL,
  is_official_mock INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  total_questions INTEGER NOT NULL DEFAULT 200,
  skill_distribution_json TEXT,
  difficulty_distribution_json TEXT,
  topic_constraints_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'student',
  grade INTEGER NOT NULL,
  title TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  blueprint_id TEXT,
  mode TEXT NOT NULL DEFAULT 'mock_exam',
  game_skin TEXT NOT NULL DEFAULT 'standard',
  ticket_token TEXT,
  total_questions INTEGER NOT NULL,
  question_snapshots_json TEXT NOT NULL,
  user_answers_json TEXT NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  accuracy_rate REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TEXT NOT NULL,
  submitted_at TEXT,
  client_meta_json TEXT
);

CREATE TABLE IF NOT EXISTS leaderboard_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  school_name TEXT,
  grade INTEGER NOT NULL,
  round INTEGER NOT NULL DEFAULT 1,
  competition_level TEXT NOT NULL DEFAULT 'school',
  score INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  accuracy_rate REAL NOT NULL,
  recorded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media_records (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  category TEXT NOT NULL,
  relative_path TEXT NOT NULL,
  storage_driver TEXT NOT NULL DEFAULT 'filesystem',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details_json TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_media_id TEXT,
  author_uid TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  author_name TEXT,
  author_role TEXT DEFAULT 'teacher',
  grade INTEGER DEFAULT 0,
  category TEXT DEFAULT 'guide',
  tags_json TEXT,
  view_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  uploader_uid TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  uploader_name TEXT,
  grade INTEGER DEFAULT 0,
  category TEXT DEFAULT 'exam_paper',
  download_count INTEGER DEFAULT 0
);

-- ==========================================================
-- INDEXES FOR HIGH CONCURRENCY AND BOUNDED QUERIES
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_questions_grade_skill ON questions(grade, skill, quality_status);
CREATE INDEX IF NOT EXISTS idx_questions_quality ON questions(quality_status);
CREATE INDEX IF NOT EXISTS idx_blueprints_grade ON exam_blueprints(grade);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON attempts(status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_grade_score ON leaderboard_records(grade, score DESC, duration_seconds ASC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_uid, status);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_uploader ON documents(uploader_uid, status);
`;
