CREATE DATABASE IF NOT EXISTS smart_campus DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE smart_campus;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS academic_warning;

DROP TABLE IF EXISTS attendance_record;

DROP TABLE IF EXISTS grade_record;

DROP TABLE IF EXISTS class_schedule;

DROP TABLE IF EXISTS announcement;

DROP TABLE IF EXISTS system_config;

DROP TABLE IF EXISTS academic_calendar_day;

DROP TABLE IF EXISTS academic_calendar;

DROP TABLE IF EXISTS teaching_class_student;

DROP TABLE IF EXISTS teaching_class;

DROP TABLE IF EXISTS student_profile;

DROP TABLE IF EXISTS teacher_profile;

DROP TABLE IF EXISTS course;

DROP TABLE IF EXISTS admin_class;

DROP TABLE IF EXISTS major;

DROP TABLE IF EXISTS college;

DROP TABLE IF EXISTS semester;

DROP TABLE IF EXISTS sys_user_role;

DROP TABLE IF EXISTS sys_permission;

DROP TABLE IF EXISTS sys_role;

DROP TABLE IF EXISTS sys_user;

CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    real_name VARCHAR(64) NOT NULL,
    user_type VARCHAR(20) NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    last_login_time DATETIME NULL,
    email VARCHAR(128) NULL,
    wechat_bound TINYINT NOT NULL DEFAULT 0,
    campus_identity VARCHAR(128) NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_sys_user_username (username),
    KEY idx_sys_user_type (user_type),
    KEY idx_sys_user_deleted (deleted)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE sys_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(64) NOT NULL,
    data_scope VARCHAR(20) NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_sys_role_code (code),
    KEY idx_sys_role_deleted (deleted)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE sys_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(128) NOT NULL,
    name VARCHAR(64) NOT NULL,
    menu_path VARCHAR(128) NULL,
    role_code VARCHAR(64) NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_sys_permission_code_role (code, role_code),
    KEY idx_sys_permission_role (role_code),
    CONSTRAINT fk_sys_permission_role FOREIGN KEY (role_code) REFERENCES sys_role (code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE sys_user_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_sys_user_role (user_id, role_id),
    KEY idx_sys_user_role_user (user_id),
    KEY idx_sys_user_role_role (role_id),
    CONSTRAINT fk_sys_user_role_user FOREIGN KEY (user_id) REFERENCES sys_user (id),
    CONSTRAINT fk_sys_user_role_role FOREIGN KEY (role_id) REFERENCES sys_role (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE semester (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(64) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_flag TINYINT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_semester_name (name),
    KEY idx_semester_current (current_flag),
    KEY idx_semester_deleted (deleted)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE college (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    short_name VARCHAR(64) NULL,
    teacher_code CHAR(2) NOT NULL,
    founded_year INT NULL,
    display_order INT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_college_code (code),
    UNIQUE KEY uk_college_teacher_code (teacher_code),
    KEY idx_college_order (display_order),
    KEY idx_college_deleted (deleted)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE major (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    college_id BIGINT NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_major_code (code),
    KEY idx_major_college (college_id),
    KEY idx_major_deleted (deleted),
    CONSTRAINT fk_major_college FOREIGN KEY (college_id) REFERENCES college (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE admin_class (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    major_id BIGINT NOT NULL,
    class_name VARCHAR(128) NOT NULL,
    grade_year INT NOT NULL,
    class_no INT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_admin_class_name (class_name),
    KEY idx_admin_class_major (major_id),
    KEY idx_admin_class_deleted (deleted),
    CONSTRAINT fk_admin_class_major FOREIGN KEY (major_id) REFERENCES major (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE course (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    alias_name VARCHAR(128) NULL,
    college_id BIGINT NULL,
    credit DECIMAL(4, 1) NOT NULL,
    hours INT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_course_code (code),
    KEY idx_course_college (college_id),
    KEY idx_course_name (name),
    KEY idx_course_alias_name (alias_name),
    KEY idx_course_deleted (deleted),
    CONSTRAINT fk_course_college FOREIGN KEY (college_id) REFERENCES college (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE teacher_profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    teacher_no VARCHAR(64) NOT NULL,
    college_id BIGINT NULL,
    department VARCHAR(128) NOT NULL,
    title VARCHAR(64) NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_teacher_user (user_id),
    UNIQUE KEY uk_teacher_no (teacher_no),
    KEY idx_teacher_college (college_id),
    KEY idx_teacher_department (department),
    CONSTRAINT fk_teacher_profile_user FOREIGN KEY (user_id) REFERENCES sys_user (id),
    CONSTRAINT fk_teacher_profile_college FOREIGN KEY (college_id) REFERENCES college (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE student_profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    student_no VARCHAR(64) NOT NULL,
    major_id BIGINT NULL,
    admin_class_id BIGINT NULL,
    major VARCHAR(128) NOT NULL,
    class_name VARCHAR(128) NOT NULL,
    grade_year INT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_student_user (user_id),
    UNIQUE KEY uk_student_no (student_no),
    KEY idx_student_major_id (major_id),
    KEY idx_student_admin_class (admin_class_id),
    KEY idx_student_major (major),
    KEY idx_student_class (class_name),
    CONSTRAINT fk_student_profile_user FOREIGN KEY (user_id) REFERENCES sys_user (id),
    CONSTRAINT fk_student_profile_major FOREIGN KEY (major_id) REFERENCES major (id),
    CONSTRAINT fk_student_profile_admin_class FOREIGN KEY (admin_class_id) REFERENCES admin_class (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE teaching_class (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    class_code VARCHAR(64) NOT NULL,
    class_name VARCHAR(128) NOT NULL,
    semester_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    capacity INT NOT NULL DEFAULT 60,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_teaching_class_code (class_code),
    KEY idx_teaching_class_semester (semester_id),
    KEY idx_teaching_class_course (course_id),
    KEY idx_teaching_class_teacher (teacher_id),
    KEY idx_teaching_class_deleted (deleted),
    CONSTRAINT fk_teaching_class_semester FOREIGN KEY (semester_id) REFERENCES semester (id),
    CONSTRAINT fk_teaching_class_course FOREIGN KEY (course_id) REFERENCES course (id),
    CONSTRAINT fk_teaching_class_teacher FOREIGN KEY (teacher_id) REFERENCES teacher_profile (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE teaching_class_student (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    teaching_class_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_class_student (teaching_class_id, student_id),
    KEY idx_enrollment_class (teaching_class_id),
    KEY idx_enrollment_student (student_id),
    CONSTRAINT fk_tcs_class FOREIGN KEY (teaching_class_id) REFERENCES teaching_class (id),
    CONSTRAINT fk_tcs_student FOREIGN KEY (student_id) REFERENCES student_profile (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE class_schedule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    teaching_class_id BIGINT NOT NULL,
    day_of_week INT NOT NULL,
    start_section INT NOT NULL,
    end_section INT NOT NULL,
    start_week INT NOT NULL,
    end_week INT NOT NULL,
    classroom VARCHAR(128) NOT NULL,
    location VARCHAR(128) NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    KEY idx_schedule_class (teaching_class_id),
    KEY idx_schedule_day_section (day_of_week, start_section),
    KEY idx_schedule_deleted (deleted),
    CONSTRAINT fk_class_schedule_class FOREIGN KEY (teaching_class_id) REFERENCES teaching_class (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE grade_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    teaching_class_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    regular_score DECIMAL(5, 2) NOT NULL,
    final_score DECIMAL(5, 2) NOT NULL,
    total_score DECIMAL(5, 2) NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_grade_class_student (teaching_class_id, student_id),
    KEY idx_grade_class (teaching_class_id),
    KEY idx_grade_student (student_id),
    KEY idx_grade_total (total_score),
    CONSTRAINT fk_grade_record_class FOREIGN KEY (teaching_class_id) REFERENCES teaching_class (id),
    CONSTRAINT fk_grade_record_student FOREIGN KEY (student_id) REFERENCES student_profile (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE attendance_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    teaching_class_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    remark VARCHAR(255) NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_attendance_once (
        teaching_class_id,
        student_id,
        attendance_date
    ),
    KEY idx_attendance_class (teaching_class_id),
    KEY idx_attendance_student (student_id),
    KEY idx_attendance_date (attendance_date),
    KEY idx_attendance_status (status),
    CONSTRAINT fk_attendance_class FOREIGN KEY (teaching_class_id) REFERENCES teaching_class (id),
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES student_profile (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE academic_warning (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    teaching_class_id BIGINT NULL,
    student_id BIGINT NOT NULL,
    warning_level VARCHAR(20) NOT NULL,
    reason VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    generated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    KEY idx_warning_class (teaching_class_id),
    KEY idx_warning_student (student_id),
    KEY idx_warning_level (warning_level),
    KEY idx_warning_status (status),
    CONSTRAINT fk_warning_class FOREIGN KEY (teaching_class_id) REFERENCES teaching_class (id),
    CONSTRAINT fk_warning_student FOREIGN KEY (student_id) REFERENCES student_profile (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE announcement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(20) NOT NULL,
    summary VARCHAR(500) NOT NULL,
    content TEXT NULL,
    source_url VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    pinned TINYINT NOT NULL DEFAULT 0,
    publisher_id BIGINT NOT NULL,
    publish_time DATETIME NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    KEY idx_announcement_category (category),
    KEY idx_announcement_status (status),
    KEY idx_announcement_publish (publish_time),
    KEY idx_announcement_deleted (deleted),
    CONSTRAINT fk_announcement_publisher FOREIGN KEY (publisher_id) REFERENCES sys_user (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE system_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(128) NOT NULL,
    config_name VARCHAR(128) NOT NULL,
    config_value VARCHAR(500) NOT NULL,
    description VARCHAR(500) NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_config_key (config_key),
    KEY idx_config_deleted (deleted)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE academic_calendar (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    academic_year VARCHAR(20) NOT NULL,
    term INT NOT NULL,
    year_label INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_calendar_year_term (academic_year, term),
    KEY idx_calendar_deleted (deleted)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE academic_calendar_day (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    calendar_id BIGINT NOT NULL,
    calendar_date DATE NOT NULL,
    week_no INT NULL,
    month_label VARCHAR(20) NULL,
    day_text VARCHAR(20) NOT NULL,
    event_name VARCHAR(128) NULL,
    day_type VARCHAR(20) NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT NOT NULL DEFAULT 0,
    UNIQUE KEY uk_calendar_day (calendar_id, calendar_date),
    KEY idx_calendar_day_date (calendar_date),
    KEY idx_calendar_day_type (day_type),
    CONSTRAINT fk_calendar_day_calendar FOREIGN KEY (calendar_id) REFERENCES academic_calendar (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;