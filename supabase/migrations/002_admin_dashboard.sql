-- 002: Admin Dashboard support
-- Parent(관리자/선생님)가 연결된 Student(학생) 프로필을 조회할 수 있도록 RLS 추가

-- profiles 테이블에 email 컬럼 추가 (코드에서 이미 사용 중)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Parent가 linked student의 프로필을 읽을 수 있는 정책
CREATE POLICY "Parents can read linked student profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_student_links
      WHERE parent_id = auth.uid() AND student_id = profiles.id
    )
  );

-- Student가 자신의 linked parent 프로필(이메일)을 읽을 수 있는 정책
CREATE POLICY "Students can read linked parent profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parent_student_links
      WHERE student_id = auth.uid() AND parent_id = profiles.id
    )
  );

-- Parent가 linked student의 리포트에 insert 가능 (관리자가 직접 리포트 전송 시)
CREATE POLICY "Parents can insert reports for linked students" ON reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM parent_student_links
      WHERE parent_id = auth.uid() AND student_id = reports.user_id
    )
  );
