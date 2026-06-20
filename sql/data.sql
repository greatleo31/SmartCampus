USE smart_campus;

INSERT INTO sys_user (id, username, password_hash, real_name, user_type) VALUES
(1, 'admin', '$2a$12$dZN1s4L19YWQ.Ijwe3JYUuisPkotBcbrD8lJUHq3I/nl9J6G1zXEa', '系统管理员', 'ADMIN'),
(2, 'teacher01', '$2a$12$8jApjdrDWpXo2FFnQHdVw.uW445XZlZ/3e7wDIsI0fB1Ui1o.L/Hq', '李明老师', 'TEACHER'),
(3, 'student01', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '张同学', 'STUDENT'),
(4, 'teacher02', '$2a$12$8jApjdrDWpXo2FFnQHdVw.uW445XZlZ/3e7wDIsI0fB1Ui1o.L/Hq', '陈思老师', 'TEACHER'),
(5, 'teacher03', '$2a$12$8jApjdrDWpXo2FFnQHdVw.uW445XZlZ/3e7wDIsI0fB1Ui1o.L/Hq', '周岚老师', 'TEACHER'),
(6, 'student02', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '胡行科同学', 'STUDENT'),
(7, 'student03', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '林雨晴同学', 'STUDENT'),
(8, 'student04', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '王亦辰同学', 'STUDENT'),
(9, 'student05', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '赵书涵同学', 'STUDENT'),
(10, 'student06', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '梁嘉琪同学', 'STUDENT'),
(11, 'student07', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '黄子昂同学', 'STUDENT'),
(12, 'student08', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '吴沐阳同学', 'STUDENT'),
(13, 'student09', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '郑安然同学', 'STUDENT'),
(14, 'student10', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '孙若溪同学', 'STUDENT'),
(15, 'student11', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '何嘉宁同学', 'STUDENT'),
(16, 'student12', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '郭思源同学', 'STUDENT'),
(17, 'student13', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '唐语桐同学', 'STUDENT'),
(18, 'student14', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '袁景行同学', 'STUDENT'),
(19, 'student15', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '邓心怡同学', 'STUDENT'),
(20, 'student16', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '潘泽宇同学', 'STUDENT'),
(21, 'student17', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '苏雅雯同学', 'STUDENT'),
(22, 'student18', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '马俊熙同学', 'STUDENT'),
(23, 'student19', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '冯梓萱同学', 'STUDENT'),
(24, 'student20', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '谢宇航同学', 'STUDENT'),
(25, 'student21', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '叶清越同学', 'STUDENT'),
(26, 'student22', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '罗可欣同学', 'STUDENT'),
(27, 'student23', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '高承泽同学', 'STUDENT'),
(28, 'student24', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '程依诺同学', 'STUDENT'),
(29, 'student25', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '孟子墨同学', 'STUDENT'),
(30, 'student26', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '钟予安同学', 'STUDENT'),
(31, 'student27', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '邱知夏同学', 'STUDENT'),
(32, 'student28', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '姜明轩同学', 'STUDENT'),
(33, 'student29', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '傅诗涵同学', 'STUDENT'),
(34, 'student30', '$2a$12$2KyDvIa8Es3LIaNvYkGiieqboiA5LxdnkNqtWekHzER05u9LiWv2G', '白亦凡同学', 'STUDENT');

INSERT INTO sys_role (id, code, name, data_scope) VALUES
(1, 'ADMIN', '管理员', 'ALL'),
(2, 'TEACHER', '教师', 'TEACHER_OWN'),
(3, 'STUDENT', '学生', 'STUDENT_OWN');

INSERT INTO sys_user_role (user_id, role_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 2), (5, 2),
(6, 3), (7, 3), (8, 3), (9, 3), (10, 3), (11, 3), (12, 3), (13, 3), (14, 3), (15, 3),
(16, 3), (17, 3), (18, 3), (19, 3), (20, 3), (21, 3), (22, 3), (23, 3), (24, 3), (25, 3),
(26, 3), (27, 3), (28, 3), (29, 3), (30, 3), (31, 3), (32, 3), (33, 3), (34, 3);

INSERT INTO sys_permission (code, name, menu_path, role_code) VALUES
('dashboard:view', '我的主页', '/', 'ADMIN'),
('admin:access', '管理员后台', '/admin', 'ADMIN'),
('announcement:manage', '公告管理', '/admin/announcements', 'ADMIN'),
('config:manage', '系统配置', '/admin/configs', 'ADMIN'),
('user:manage', '用户管理', '/admin/users', 'ADMIN'),
('role:manage', '角色权限', '/admin/roles', 'ADMIN'),
('semester:manage', '学期管理', '/semesters', 'ADMIN'),
('course:manage', '课程管理', '/courses', 'ADMIN'),
('class:manage', '教学班管理', '/teaching-classes', 'ADMIN'),
('schedule:manage', '课表管理', '/admin/schedules', 'ADMIN'),
('enrollment:manage', '学生名单', '/enrollments', 'ADMIN'),
('grade:manage', '成绩管理', '/grades', 'ADMIN'),
('attendance:manage', '考勤管理', '/attendance', 'ADMIN'),
('warning:view', '学业预警', '/warnings', 'ADMIN'),
('dashboard:view', '我的主页', '/', 'TEACHER'),
('schedule:view', '教学课表', '/schedule', 'TEACHER'),
('grade:manage', '成绩管理', '/grades', 'TEACHER'),
('attendance:manage', '考勤管理', '/attendance', 'TEACHER'),
('warning:view', '学业预警', '/warnings', 'TEACHER'),
('dashboard:view', '我的主页', '/', 'STUDENT'),
('student:course:view', '我的课表', '/schedule', 'STUDENT'),
('student:grade:view', '我的成绩', '/my/grades', 'STUDENT'),
('student:attendance:view', '我的考勤', '/my/attendance', 'STUDENT'),
('student:warning:view', '我的预警', '/my/warnings', 'STUDENT');

INSERT INTO teacher_profile (id, user_id, teacher_no, department, title) VALUES
(1, 2, 'T2024001', '计算机学院', '讲师'),
(2, 4, 'T2024002', '数学学院', '副教授'),
(3, 5, 'T2024003', '外国语学院', '讲师');

INSERT INTO student_profile (id, user_id, student_no, major, class_name, grade_year) VALUES
(1, 3, 'S2024001', '软件工程', '软工2401', 2024),
(2, 6, 'S2024002', '软件工程', '软工2401', 2024),
(3, 7, 'S2024003', '软件工程', '软工2401', 2024),
(4, 8, 'S2024004', '软件工程', '软工2401', 2024),
(5, 9, 'S2024005', '软件工程', '软工2401', 2024),
(6, 10, 'S2024006', '软件工程', '软工2401', 2024),
(7, 11, 'S2024007', '软件工程', '软工2401', 2024),
(8, 12, 'S2024008', '软件工程', '软工2401', 2024),
(9, 13, 'S2024009', '软件工程', '软工2401', 2024),
(10, 14, 'S2024010', '软件工程', '软工2401', 2024),
(11, 15, 'S2024011', '软件工程', '软工2402', 2024),
(12, 16, 'S2024012', '软件工程', '软工2402', 2024),
(13, 17, 'S2024013', '软件工程', '软工2402', 2024),
(14, 18, 'S2024014', '软件工程', '软工2402', 2024),
(15, 19, 'S2024015', '软件工程', '软工2402', 2024),
(16, 20, 'S2024016', '软件工程', '软工2402', 2024),
(17, 21, 'S2024017', '软件工程', '软工2402', 2024),
(18, 22, 'S2024018', '软件工程', '软工2402', 2024),
(19, 23, 'S2024019', '数据科学', '数据2401', 2024),
(20, 24, 'S2024020', '数据科学', '数据2401', 2024),
(21, 25, 'S2024021', '数据科学', '数据2401', 2024),
(22, 26, 'S2024022', '数据科学', '数据2401', 2024),
(23, 27, 'S2024023', '数据科学', '数据2401', 2024),
(24, 28, 'S2024024', '数据科学', '数据2401', 2024),
(25, 29, 'S2024025', '数据科学', '数据2401', 2024),
(26, 30, 'S2024026', '数据科学', '数据2401', 2024),
(27, 31, 'S2024027', '人工智能', '智能2401', 2024),
(28, 32, 'S2024028', '人工智能', '智能2401', 2024),
(29, 33, 'S2024029', '人工智能', '智能2401', 2024),
(30, 34, 'S2024030', '人工智能', '智能2401', 2024);

INSERT INTO semester (id, name, start_date, end_date, current_flag) VALUES
(1, '2025-2026-1', '2025-09-01', '2026-01-16', 0),
(2, '2025-2026-2', '2026-02-23', '2026-07-03', 1);

INSERT INTO course (id, code, name, credit, hours) VALUES
(1, 'CS101', '程序设计基础', 3.0, 48),
(2, 'CS204', '软件工程基础', 3.0, 48),
(3, 'MATH101', '高等数学A', 5.0, 80),
(4, 'ENG201', '大学英语IV', 2.0, 32),
(5, 'PE102', '体育IV', 1.0, 32),
(6, 'AI201', '机器学习导论', 3.0, 48),
(7, 'DS202', '数据库系统', 3.0, 48),
(8, 'POL101', '马克思主义基本原理', 3.0, 48);

INSERT INTO teaching_class (id, class_code, class_name, semester_id, course_id, teacher_id, capacity) VALUES
(1, 'CS101-2026-01', '程序设计基础-软工1班', 2, 1, 1, 60),
(2, 'CS204-2026-01', '软件工程基础-软工1班', 2, 2, 1, 60),
(3, 'MATH101-2026-01', '高等数学A-软工合班', 2, 3, 2, 90),
(4, 'ENG201-2026-01', '大学英语IV-软工合班', 2, 4, 3, 80),
(5, 'PE102-2026-01', '体育IV-东区班', 2, 5, 3, 45),
(6, 'AI201-2026-01', '机器学习导论-智能班', 2, 6, 1, 60),
(7, 'DS202-2026-01', '数据库系统-数据班', 2, 7, 1, 60),
(8, 'POL101-2026-01', '马克思主义基本原理-合班', 2, 8, 2, 120);

INSERT INTO teaching_class_student (teaching_class_id, student_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),
(2,1),(2,2),(2,3),(2,4),(2,5),(2,6),(2,7),(2,8),(2,9),(2,10),
(3,1),(3,2),(3,3),(3,4),(3,5),(3,6),(3,7),(3,8),(3,9),(3,10),(3,11),(3,12),(3,13),(3,14),(3,15),(3,16),(3,17),(3,18),
(4,1),(4,2),(4,3),(4,4),(4,5),(4,6),(4,7),(4,8),(4,9),(4,10),(4,11),(4,12),(4,13),(4,14),(4,15),(4,16),(4,17),(4,18),
(5,1),(5,3),(5,5),(5,7),(5,9),(5,11),(5,13),(5,15),(5,17),(5,19),
(6,27),(6,28),(6,29),(6,30),(6,1),(6,2),
(7,19),(7,20),(7,21),(7,22),(7,23),(7,24),(7,25),(7,26),
(8,1),(8,2),(8,3),(8,4),(8,5),(8,6),(8,7),(8,8),(8,9),(8,10),(8,19),(8,20),(8,21),(8,22);

INSERT INTO class_schedule (teaching_class_id, day_of_week, start_section, end_section, start_week, end_week, classroom, location) VALUES
(1, 2, 3, 4, 1, 16, '教四-203', '北校区教学楼'),
(1, 4, 1, 2, 1, 16, '实验楼-B302', '软件实验室'),
(2, 1, 3, 4, 1, 16, '教二-208', '北校区教学楼'),
(2, 3, 1, 2, 1, 16, '教二-208', '北校区教学楼'),
(3, 1, 1, 2, 1, 16, '教三-101', '公共教学楼'),
(3, 3, 3, 4, 1, 16, '教三-101', '公共教学楼'),
(4, 3, 1, 2, 1, 16, '外语楼-306', '语言中心'),
(4, 5, 3, 4, 1, 16, '外语楼-306', '语言中心'),
(5, 3, 3, 4, 1, 16, '东区运动场', '体育中心'),
(6, 2, 7, 8, 1, 16, '实验楼-A501', '人工智能实验室'),
(6, 5, 7, 8, 1, 16, '实验楼-A501', '人工智能实验室'),
(7, 2, 1, 2, 1, 16, '实验楼-C401', '数据工程实验室'),
(7, 4, 5, 6, 1, 16, '实验楼-C401', '数据工程实验室'),
(8, 5, 7, 8, 1, 16, '教一-报告厅', '公共教学楼');

INSERT INTO grade_record (teaching_class_id, student_id, regular_score, final_score, total_score) VALUES
(1,1,72,68,69.20),(1,2,88,91,90.10),(1,3,75,60,64.50),(1,4,64,51,54.90),(1,5,90,86,87.20),(1,6,82,79,79.90),(1,7,69,58,61.30),(1,8,93,88,89.50),(1,9,77,73,74.20),(1,10,61,55,56.80),
(2,1,80,76,77.20),(2,2,84,82,82.60),(2,3,68,63,64.50),(2,4,59,49,52.00),(2,5,91,90,90.30),(2,6,79,75,76.20),(2,7,72,70,70.60),(2,8,95,92,92.90),(2,9,74,66,68.40),(2,10,66,58,60.40),
(3,1,76,70,71.80),(3,11,81,77,78.20),(3,12,62,54,56.40),(3,13,85,83,83.60),(3,14,70,61,63.70),(3,15,92,89,89.90),(3,16,67,52,56.50),(3,17,74,72,72.60),(3,18,88,85,85.90),
(6,27,86,84,84.60),(6,28,78,70,72.40),(6,29,65,55,58.00),(6,30,90,94,92.80),(7,19,82,78,79.20),(7,20,76,68,70.40),(7,21,70,61,63.70),(7,22,88,81,83.10);

INSERT INTO attendance_record (teaching_class_id, student_id, attendance_date, status, remark) VALUES
(1,1,CURRENT_DATE(),'NORMAL',''),(1,2,CURRENT_DATE(),'NORMAL',''),(1,3,CURRENT_DATE(),'LATE','早高峰迟到'),(1,4,CURRENT_DATE(),'ABSENT','未请假'),(1,5,CURRENT_DATE(),'NORMAL',''),
(2,1,CURRENT_DATE(),'NORMAL',''),(2,4,CURRENT_DATE(),'ABSENT','连续缺勤关注'),(2,7,CURRENT_DATE(),'EARLY_LEAVE','身体不适'),(3,11,CURRENT_DATE(),'NORMAL',''),(3,12,CURRENT_DATE(),'LATE','迟到10分钟'),
(4,2,DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY),'NORMAL',''),(4,5,DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY),'NORMAL',''),(4,8,DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY),'LEAVE','事假'),(5,9,DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY),'NORMAL',''),
(6,29,DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY),'ABSENT','未到课'),(6,30,DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY),'NORMAL',''),(7,19,DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY),'NORMAL',''),(7,21,DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY),'LATE','迟到'),
(8,1,DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY),'NORMAL',''),(8,20,DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY),'ABSENT','未请假');

INSERT INTO academic_warning (teaching_class_id, student_id, warning_level, reason, status, generated_time) VALUES
(1,4,'HIGH','程序设计基础总评低于60且存在缺勤记录','OPEN',DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2,4,'HIGH','软件工程基础连续缺勤且成绩低于预警线','OPEN',NOW()),
(1,10,'MEDIUM','阶段测验偏低，建议参加答疑','OPEN',DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3,12,'MEDIUM','高等数学A期中成绩低于班级均值','OPEN',DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6,29,'HIGH','机器学习导论总评低于60并有旷课记录','OPEN',DATE_SUB(NOW(), INTERVAL 4 DAY)),
(7,21,'LOW','数据库系统课堂练习完成率偏低','OPEN',DATE_SUB(NOW(), INTERVAL 5 DAY));

INSERT INTO announcement (title, category, summary, content, status, pinned, publisher_id, publish_time) VALUES
('关于组织参加全省第八届大学生艺术展演活动的通知','NOTICE','请各学院按要求完成节目推荐与报名材料提交。','各学院需在本周五前提交节目清单、指导教师信息和参演学生名单。','PUBLISHED',1,1,DATE_SUB(NOW(), INTERVAL 1 DAY)),
('关于2026年6月学院领取研究生毕业证、学位证的通知','NOTICE','毕业证与学位证领取安排已发布。','请毕业生携带有效证件按学院通知时间到指定地点领取。','PUBLISHED',0,1,DATE_SUB(NOW(), INTERVAL 2 DAY)),
('2026年6月学位授予点动态调整公示','PUBLICITY','学位授权点动态调整结果进入公示期。','公示期为五个工作日，如有异议请向教务运行中心反馈。','PUBLISHED',0,1,DATE_SUB(NOW(), INTERVAL 3 DAY)),
('关于召开本科教学质量分析会的通知','MEETING','会议将围绕本学期教学质量数据进行分析。','请各学院教学负责人、专业负责人准时参会。','PUBLISHED',1,1,DATE_SUB(NOW(), INTERVAL 4 DAY)),
('人工智能通识讲座报名通知','LECTURE','邀请行业专家分享生成式人工智能在教育中的应用。','讲座面向全校师生开放，座位有限，先到先得。','PUBLISHED',0,1,DATE_SUB(NOW(), INTERVAL 5 DAY)),
('关于公示2025年度学生竞赛拟奖励名单的通知','PUBLICITY','学生竞赛拟奖励名单已进入公示。','公示期间接受实名反馈，逾期不再受理。','PUBLISHED',0,1,DATE_SUB(NOW(), INTERVAL 6 DAY));

INSERT INTO system_config (config_key, config_name, config_value, description) VALUES
('site.name','系统名称','智慧校园','展示在浏览器标题和侧栏品牌区'),
('semester.current','当前学期','2025-2026-2','首页与课表默认学期'),
('notice.review_required','公告发布审核','false','true 表示公告发布前需要复核'),
('weather.city','天气城市','广州','首页天气默认城市');
