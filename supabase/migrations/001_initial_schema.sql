-- DailySeed Supabase Schema
-- Run this in Supabase SQL Editor

-- 1. Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'parent')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Missions table
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  page TEXT NOT NULL CHECK (page IN ('news','classic','art','world','why','english')),
  date TEXT NOT NULL,
  answer_data TEXT,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, page, date)
);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own missions" ON missions
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM parent_student_links
      WHERE parent_id = auth.uid() AND student_id = missions.user_id
    )
  );

CREATE POLICY "Users can insert own missions" ON missions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own missions" ON missions
  FOR UPDATE USING (user_id = auth.uid());

-- 3. Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  parent_email TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reports" ON reports
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM parent_student_links
      WHERE parent_id = auth.uid() AND student_id = reports.user_id
    )
  );

CREATE POLICY "Users can insert own reports" ON reports
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 4. Parent-Student Links
CREATE TABLE parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage their links" ON parent_student_links
  FOR ALL USING (parent_id = auth.uid());

CREATE POLICY "Students can see their links" ON parent_student_links
  FOR SELECT USING (student_id = auth.uid());

-- 5. Indexes
CREATE INDEX idx_missions_user_date ON missions(user_id, date);
CREATE INDEX idx_reports_user_date ON reports(user_id, date);
CREATE INDEX idx_links_parent ON parent_student_links(parent_id);
CREATE INDEX idx_links_student ON parent_student_links(student_id);

-- 6. Updated_at trigger for profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
