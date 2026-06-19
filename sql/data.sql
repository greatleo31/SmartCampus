USE smart_campus;

INSERT INTO sys_user (id, username, password_hash, real_name, user_type) VALUES
(1, 'admin', '$2b$12$v7u5AnN31bJKRd/9YEMPa.iqwIOomuqBXusAvlqaKzVpqr2cwVaju', '系统管理员', 'ADMIN'),
(2, 'teacher01', '$2b$12$IAkNQU./US1FyJCqFIEcfuZseBfAYwN4VYwKAPr7mXNiex8V4tgeG', '李老师', 'TEACHER'),
(3, 'student01', '$2b$12$fh4JmGv9VVrN1/8SErr8su9tZekLBhZP6GnbaKgJgqirkFgNjhLr.', '张同学', 'STUDENT');

INSERT INTO sys_role (id, code, name, data_scope) VALUES
(1, 'ADMIN', '管理员', 'ALL'),
(2, 'TEACHER', '教师', 'TEACHER_OWN'),
(3, 'STUDENT', '学生', 'STUDENT_OWN');

INSERT INTO sys_user_role (user_id, role_id) VALUES (1, 1), (2, 2), (3, 3);

INSERT INTO sys_permission (code, name, menu_path, role_code) VALUES
('dashboard:view', '首页仪表盘', '/', 'ADMIN'),
('semester:manage', '学期管理', '/semesters', 'ADMIN'),
('course:manage', '课程管理', '/courses', 'ADMIN'),
('class:manage', '教学班管理', '/teaching-classes', 'ADMIN'),
('enrollment:manage', '学生名单', '/enrollments', 'ADMIN'),
('grade:manage', '成绩管理', '/grades', 'ADMIN'),
('attendance:manage', '考勤管理', '/attendance', 'ADMIN'),
('warning:view', '学业预警', '/warnings', 'ADMIN'),
('dashboard:view', '首页仪表盘', '/', 'TEACHER'),
('grade:manage', '成绩管理', '/grades', 'TEACHER'),
('attendance:manage', '考勤管理', '/attendance', 'TEACHER'),
('warning:view', '学业预警', '/warnings', 'TEACHER'),
('dashboard:view', '首页仪表盘', '/', 'STUDENT'),
('student:course:view', '我的课程', '/my/courses', 'STUDENT'),
('student:grade:view', '我的成绩', '/my/grades', 'STUDENT'),
('student:attendance:view', '我的考勤', '/my/attendance', 'STUDENT'),
('student:warning:view', '我的预警', '/my/warnings', 'STUDENT');

INSERT INTO teacher_profile (id, user_id, teacher_no, department, title) VALUES
(1, 2, 'T2024001', '计算机学院', '讲师');

INSERT INTO student_profile (id, user_id, student_no, major, class_name, grade_year) VALUES
(1, 3, 'S2024001', '软件工程', '软工2401', 2024);

INSERT INTO semester (id, name, start_date, end_date, current_flag) VALUES
(1, '2025-2026-1', '2025-09-01', '2026-01-16', 1);

INSERT INTO course (id, code, name, credit, hours) VALUES
(1, 'CS101', '程序设计基础', 3.0, 48),
(2, 'MATH101', '高等数学A', 5.0, 80);

INSERT INTO teaching_class (id, class_code, class_name, semester_id, course_id, teacher_id, capacity) VALUES
(1, 'CS101-2025-01', '程序设计基础-1班', 1, 1, 1, 60);

INSERT INTO teaching_class_student (teaching_class_id, student_id) VALUES (1, 1);

INSERT INTO grade_record (teaching_class_id, student_id, regular_score, final_score, total_score) VALUES
(1, 1, 70.00, 52.00, 59.20);

INSERT INTO attendance_record (teaching_class_id, student_id, attendance_date, status, remark) VALUES
(1, 1, CURRENT_DATE(), 'ABSENT', '演示缺勤'),
(1, 1, DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'LATE', '演示迟到');

INSERT INTO academic_warning (teaching_class_id, student_id, warning_level, reason, status) VALUES
(1, 1, 'HIGH', '总评低于60且存在缺勤记录', 'OPEN');
