USE smart_campus;

DROP VIEW IF EXISTS v_student_learning_summary;
DROP VIEW IF EXISTS v_teaching_class_grade_stat;
DROP VIEW IF EXISTS v_academic_warning_source;

CREATE VIEW v_student_learning_summary AS
SELECT
  sp.id AS student_id,
  sp.student_no,
  u.real_name AS student_name,
  COUNT(DISTINCT tcs.teaching_class_id) AS class_count,
  ROUND(AVG(gr.total_score), 2) AS avg_score,
  SUM(CASE WHEN gr.total_score < 60 THEN 1 ELSE 0 END) AS failed_count,
  SUM(CASE WHEN ar.status IN ('LATE', 'EARLY_LEAVE', 'ABSENT') THEN 1 ELSE 0 END) AS abnormal_attendance_count
FROM student_profile sp
JOIN sys_user u ON u.id = sp.user_id AND u.deleted = 0
LEFT JOIN teaching_class_student tcs ON tcs.student_id = sp.id AND tcs.deleted = 0
LEFT JOIN grade_record gr ON gr.student_id = sp.id AND gr.deleted = 0
LEFT JOIN attendance_record ar ON ar.student_id = sp.id AND ar.deleted = 0
WHERE sp.deleted = 0
GROUP BY sp.id, sp.student_no, u.real_name;

CREATE VIEW v_teaching_class_grade_stat AS
SELECT
  tc.id AS teaching_class_id,
  tc.class_code,
  tc.class_name,
  c.name AS course_name,
  COUNT(gr.id) AS graded_count,
  ROUND(AVG(gr.total_score), 2) AS avg_score,
  MIN(gr.total_score) AS min_score,
  MAX(gr.total_score) AS max_score,
  SUM(CASE WHEN gr.total_score < 60 THEN 1 ELSE 0 END) AS failed_count
FROM teaching_class tc
JOIN course c ON c.id = tc.course_id AND c.deleted = 0
LEFT JOIN grade_record gr ON gr.teaching_class_id = tc.id AND gr.deleted = 0
WHERE tc.deleted = 0
GROUP BY tc.id, tc.class_code, tc.class_name, c.name;

CREATE VIEW v_academic_warning_source AS
SELECT
  tcs.teaching_class_id,
  tcs.student_id,
  COALESCE(gr.total_score, 100) AS total_score,
  SUM(CASE WHEN ar.status = 'ABSENT' THEN 1 ELSE 0 END) AS absent_count,
  SUM(CASE WHEN ar.status IN ('LATE', 'EARLY_LEAVE') THEN 1 ELSE 0 END) AS late_or_early_count
FROM teaching_class_student tcs
LEFT JOIN grade_record gr ON gr.teaching_class_id = tcs.teaching_class_id AND gr.student_id = tcs.student_id AND gr.deleted = 0
LEFT JOIN attendance_record ar ON ar.teaching_class_id = tcs.teaching_class_id AND ar.student_id = tcs.student_id AND ar.deleted = 0
WHERE tcs.deleted = 0
GROUP BY tcs.teaching_class_id, tcs.student_id, gr.total_score;
