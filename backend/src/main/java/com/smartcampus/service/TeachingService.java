package com.smartcampus.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.smartcampus.common.PageRequest;
import com.smartcampus.common.PageResult;
import com.smartcampus.domain.*;
import com.smartcampus.dto.AttendanceRequest;
import com.smartcampus.dto.EnrollmentRequest;
import com.smartcampus.dto.GradeRequest;
import com.smartcampus.dto.TeachingClassRequest;
import com.smartcampus.exception.BizException;
import com.smartcampus.mapper.*;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.security.SecurityUtils;
import com.smartcampus.vo.DashboardVO;
import com.smartcampus.vo.TrendPointVO;
import com.smartcampus.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TeachingService {
    private final CatalogService catalogService;
    private final AccessService accessService;
    private final TeachingClassMapper teachingClassMapper;
    private final TeacherProfileMapper teacherProfileMapper;
    private final StudentProfileMapper studentProfileMapper;
    private final TeachingClassStudentMapper enrollmentMapper;
    private final GradeRecordMapper gradeMapper;
    private final AttendanceRecordMapper attendanceMapper;
    private final AcademicWarningMapper warningMapper;
    private final CourseMapper courseMapper;
    private final SemesterMapper semesterMapper;
    private final SysUserMapper userMapper;
    private final CollegeMapper collegeMapper;
    private final MajorMapper majorMapper;
    private final AdminClassMapper adminClassMapper;
    private final ClassScheduleMapper classScheduleMapper;

    public PageResult<TeachingClassVO> teachingClasses(PageRequest request) {
        CurrentUser user = SecurityUtils.currentUser();
        LambdaQueryWrapper<TeachingClass> wrapper = new LambdaQueryWrapper<TeachingClass>()
                .and(StringUtils.hasText(request.keyword()), w -> w
                        .like(TeachingClass::getClassName, request.keyword())
                        .or()
                        .like(TeachingClass::getClassCode, request.keyword()))
                .orderByDesc(TeachingClass::getId);
        applySemesterFilter(wrapper, request);
        if (user.isTeacher()) {
            wrapper.eq(TeachingClass::getTeacherId, accessService.currentTeacherId());
        } else if (user.isStudent()) {
            Long studentId = accessService.currentStudentId();
            List<Long> classIds = enrollmentMapper.selectList(new LambdaQueryWrapper<TeachingClassStudent>()
                            .eq(TeachingClassStudent::getStudentId, studentId))
                    .stream().map(TeachingClassStudent::getTeachingClassId).toList();
            if (classIds.isEmpty()) {
                return new PageResult<>(0, request.page(), request.size(), List.of());
            }
            wrapper.in(TeachingClass::getId, classIds);
        }
        Page<TeachingClass> page = teachingClassMapper.selectPage(new Page<>(request.page(), request.size()), wrapper);
        return new PageResult<>(page.getTotal(), page.getCurrent(), page.getSize(), page.getRecords().stream().map(this::toTeachingClassVO).toList());
    }

    public List<TeacherProfileVO> teachers() {
        return teacherProfileMapper.selectList(new LambdaQueryWrapper<TeacherProfile>()
                        .orderByAsc(TeacherProfile::getTeacherNo))
                .stream()
                .map(this::toTeacherProfileVO)
                .toList();
    }

    public List<StudentProfileVO> students() {
        return studentProfileMapper.selectList(new LambdaQueryWrapper<StudentProfile>()
                        .orderByAsc(StudentProfile::getGradeYear)
                        .orderByAsc(StudentProfile::getClassName)
                        .orderByAsc(StudentProfile::getStudentNo))
                .stream()
                .map(this::toStudentProfileVO)
                .toList();
    }

    public TeachingClass saveTeachingClass(Long id, TeachingClassRequest request) {
        catalogService.requireSemester(request.semesterId());
        catalogService.requireCourse(request.courseId());
        if (teacherProfileMapper.selectById(request.teacherId()) == null) {
            throw new BizException(404, "教师不存在");
        }
        TeachingClass teachingClass = id == null ? new TeachingClass() : accessService.requireTeachingClass(id);
        teachingClass.setClassCode(request.classCode());
        teachingClass.setClassName(request.className());
        teachingClass.setSemesterId(request.semesterId());
        teachingClass.setCourseId(request.courseId());
        teachingClass.setTeacherId(request.teacherId());
        teachingClass.setCapacity(request.capacity());
        if (id == null) {
            teachingClassMapper.insert(teachingClass);
        } else {
            teachingClassMapper.updateById(teachingClass);
        }
        return teachingClass;
    }

    public void deleteTeachingClass(Long id) {
        accessService.requireTeachingClass(id);
        teachingClassMapper.deleteById(id);
    }

    @Transactional
    public TeachingClassStudent enroll(EnrollmentRequest request) {
        accessService.assertClassScope(request.teachingClassId());
        if (studentProfileMapper.selectById(request.studentId()) == null) {
            throw new BizException(404, "学生不存在");
        }
        long count = enrollmentMapper.selectCount(new LambdaQueryWrapper<TeachingClassStudent>()
                .eq(TeachingClassStudent::getTeachingClassId, request.teachingClassId())
                .eq(TeachingClassStudent::getStudentId, request.studentId()));
        if (count > 0) {
            throw new BizException(400, "学生已在该教学班名单中");
        }
        TeachingClassStudent enrollment = new TeachingClassStudent();
        enrollment.setTeachingClassId(request.teachingClassId());
        enrollment.setStudentId(request.studentId());
        enrollmentMapper.insert(enrollment);
        return enrollment;
    }

    public List<EnrollmentVO> enrollments(Long teachingClassId) {
        accessService.assertClassScope(teachingClassId);
        return enrollmentMapper.selectList(new LambdaQueryWrapper<TeachingClassStudent>()
                .eq(TeachingClassStudent::getTeachingClassId, teachingClassId))
                .stream()
                .map(this::toEnrollmentVO)
                .sorted(Comparator
                        .comparing(EnrollmentVO::studentNo, Comparator.nullsLast(String::compareTo))
                        .thenComparing(EnrollmentVO::studentName, Comparator.nullsLast(String::compareTo)))
                .toList();
    }

    public void deleteEnrollment(Long id) {
        TeachingClassStudent enrollment = enrollmentMapper.selectById(id);
        if (enrollment == null) {
            throw new BizException(404, "名单记录不存在");
        }
        accessService.assertClassScope(enrollment.getTeachingClassId());
        enrollmentMapper.deleteById(id);
    }

    @Transactional
    public GradeRecord saveGrade(Long id, GradeRequest request) {
        assertEnrollmentAndScope(request.teachingClassId(), request.studentId());
        GradeRecord record = id == null ? gradeMapper.selectOne(new LambdaQueryWrapper<GradeRecord>()
                .eq(GradeRecord::getTeachingClassId, request.teachingClassId())
                .eq(GradeRecord::getStudentId, request.studentId())) : gradeMapper.selectById(id);
        if (record == null) {
            record = new GradeRecord();
            record.setTeachingClassId(request.teachingClassId());
            record.setStudentId(request.studentId());
        }
        record.setRegularScore(request.regularScore());
        record.setFinalScore(request.finalScore());
        record.setTotalScore(ScoreCalculator.total(request.regularScore(), request.finalScore()));
        if (record.getId() == null) {
            gradeMapper.insert(record);
        } else {
            gradeMapper.updateById(record);
        }
        return record;
    }

    public List<GradeRecord> grades(Long teachingClassId, Long studentId) {
        LambdaQueryWrapper<GradeRecord> wrapper = new LambdaQueryWrapper<GradeRecord>()
                .eq(teachingClassId != null, GradeRecord::getTeachingClassId, teachingClassId)
                .eq(studentId != null, GradeRecord::getStudentId, studentId)
                .orderByDesc(GradeRecord::getId);
        applyGradeScope(wrapper);
        return gradeMapper.selectList(wrapper);
    }

    public PageResult<GradeRecordVO> gradeViews(PageRequest request, Long teachingClassId, Long studentId) {
        List<GradeRecordVO> rows = grades(teachingClassId, studentId).stream()
                .map(this::toGradeVO)
                .filter(item -> matchesSemester(item.semesterName(), request))
                .filter(item -> !StringUtils.hasText(request.keyword()) || containsAny(request.keyword(), item.courseName(), item.teachingClassName(), item.studentName(), item.studentNo(), item.semesterName()))
                .sorted(Comparator
                        .comparing(GradeRecordVO::studentNo, Comparator.nullsLast(String::compareTo))
                        .thenComparing(GradeRecordVO::semesterName, Comparator.nullsLast(String::compareTo))
                        .thenComparing(GradeRecordVO::courseName, Comparator.nullsLast(String::compareTo)))
                .toList();
        return paginate(rows, request);
    }

    public void deleteGrade(Long id) {
        GradeRecord record = gradeMapper.selectById(id);
        if (record == null) {
            throw new BizException(404, "成绩记录不存在");
        }
        accessService.assertClassScope(record.getTeachingClassId());
        gradeMapper.deleteById(id);
    }

    public void deleteGrades(List<Long> ids) {
        ids.forEach(this::deleteGrade);
    }

    @Transactional
    public AttendanceRecord saveAttendance(Long id, AttendanceRequest request) {
        assertAttendanceStatus(request.status());
        assertEnrollmentAndScope(request.teachingClassId(), request.studentId());
        AttendanceRecord record = id == null ? attendanceMapper.selectOne(new LambdaQueryWrapper<AttendanceRecord>()
                .eq(AttendanceRecord::getTeachingClassId, request.teachingClassId())
                .eq(AttendanceRecord::getStudentId, request.studentId())
                .eq(AttendanceRecord::getAttendanceDate, request.attendanceDate())) : attendanceMapper.selectById(id);
        if (record == null) {
            record = new AttendanceRecord();
            record.setTeachingClassId(request.teachingClassId());
            record.setStudentId(request.studentId());
        }
        record.setAttendanceDate(request.attendanceDate());
        record.setStatus(request.status());
        record.setRemark(request.remark());
        if (record.getId() == null) {
            attendanceMapper.insert(record);
        } else {
            attendanceMapper.updateById(record);
        }
        return record;
    }

    public List<AttendanceRecord> attendance(Long teachingClassId, Long studentId) {
        LambdaQueryWrapper<AttendanceRecord> wrapper = new LambdaQueryWrapper<AttendanceRecord>()
                .eq(teachingClassId != null, AttendanceRecord::getTeachingClassId, teachingClassId)
                .eq(studentId != null, AttendanceRecord::getStudentId, studentId)
                .orderByDesc(AttendanceRecord::getAttendanceDate);
        applyAttendanceScope(wrapper);
        return attendanceMapper.selectList(wrapper);
    }

    public PageResult<AttendanceRecordVO> attendanceViews(PageRequest request, Long teachingClassId, Long studentId) {
        List<AttendanceRecordVO> rows = attendance(teachingClassId, studentId).stream()
                .map(this::toAttendanceVO)
                .filter(item -> matchesSemester(item.semesterName(), request))
                .filter(item -> !StringUtils.hasText(request.keyword()) || containsAny(request.keyword(), item.adminClassName(), item.studentNo(), item.studentName(), item.courseName(), item.teachingClassName(), item.teacherName(), item.classroom()))
                .sorted(Comparator
                        .comparing(AttendanceRecordVO::adminClassName, Comparator.nullsLast(String::compareTo))
                        .thenComparing(AttendanceRecordVO::studentNo, Comparator.nullsLast(String::compareTo))
                        .thenComparing(AttendanceRecordVO::attendanceDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(AttendanceRecordVO::teachingClassName, Comparator.nullsLast(String::compareTo)))
                .toList();
        return paginate(rows, request);
    }

    public void deleteAttendance(Long id) {
        AttendanceRecord record = attendanceMapper.selectById(id);
        if (record == null) {
            throw new BizException(404, "考勤记录不存在");
        }
        accessService.assertClassScope(record.getTeachingClassId());
        attendanceMapper.deleteById(id);
    }

    public void deleteAttendanceBatch(List<Long> ids) {
        ids.forEach(this::deleteAttendance);
    }

    @Transactional
    public int recalculateWarnings() {
        CurrentUser user = SecurityUtils.currentUser();
        List<TeachingClassStudent> enrollments = enrollmentMapper.selectList(new LambdaQueryWrapper<TeachingClassStudent>());
        int generated = 0;
        for (TeachingClassStudent enrollment : enrollments) {
            if (!canSeePair(user, enrollment.getTeachingClassId(), enrollment.getStudentId())) {
                continue;
            }
            List<AttendanceRecord> records = attendanceMapper.selectList(new LambdaQueryWrapper<AttendanceRecord>()
                    .eq(AttendanceRecord::getTeachingClassId, enrollment.getTeachingClassId())
                    .eq(AttendanceRecord::getStudentId, enrollment.getStudentId()));
            long absent = records.stream().filter(r -> "ABSENT".equals(r.getStatus())).count();
            long lateOrEarly = records.stream().filter(r -> "LATE".equals(r.getStatus()) || "EARLY_LEAVE".equals(r.getStatus())).count();
            WarningRuleEngine.WarningDecision decision = WarningRuleEngine.evaluate(absent, lateOrEarly);
            if (decision.hasWarning()) {
                AcademicWarning warning = warningMapper.selectOne(new LambdaQueryWrapper<AcademicWarning>()
                        .eq(AcademicWarning::getTeachingClassId, enrollment.getTeachingClassId())
                        .eq(AcademicWarning::getStudentId, enrollment.getStudentId())
                        .eq(AcademicWarning::getStatus, "OPEN")
                        .last("limit 1"));
                if (warning == null) {
                    warning = new AcademicWarning();
                    warning.setTeachingClassId(enrollment.getTeachingClassId());
                    warning.setStudentId(enrollment.getStudentId());
                }
                warning.setTeachingClassId(enrollment.getTeachingClassId());
                warning.setStudentId(enrollment.getStudentId());
                warning.setWarningLevel(decision.level());
                warning.setReason(decision.reason());
                warning.setStatus("OPEN");
                warning.setGeneratedTime(LocalDateTime.now());
                if (warning.getId() == null) {
                    warningMapper.insert(warning);
                } else {
                    warningMapper.updateById(warning);
                }
                generated++;
            }
        }
        return generated;
    }

    public List<AcademicWarning> warnings(Long studentId) {
        LambdaQueryWrapper<AcademicWarning> wrapper = new LambdaQueryWrapper<AcademicWarning>()
                .eq(studentId != null, AcademicWarning::getStudentId, studentId)
                .orderByDesc(AcademicWarning::getGeneratedTime);
        applyWarningScope(wrapper);
        return warningMapper.selectList(wrapper).stream()
                .sorted((left, right) -> {
                    WarningCounts leftCounts = warningCounts(left.getTeachingClassId(), left.getStudentId());
                    WarningCounts rightCounts = warningCounts(right.getTeachingClassId(), right.getStudentId());
                    int absentCompare = Long.compare(rightCounts.absentCount(), leftCounts.absentCount());
                    if (absentCompare != 0) {
                        return absentCompare;
                    }
                    int lateCompare = Long.compare(rightCounts.lateOrEarlyCount(), leftCounts.lateOrEarlyCount());
                    if (lateCompare != 0) {
                        return lateCompare;
                    }
                    return right.getGeneratedTime().compareTo(left.getGeneratedTime());
                })
                .toList();
    }

    public List<AcademicWarningVO> warningViews(Long studentId) {
        return warnings(studentId).stream()
                .map(this::toWarningVO)
                .sorted(Comparator
                        .comparing(AcademicWarningVO::studentNo, Comparator.nullsLast(String::compareTo))
                        .thenComparing(AcademicWarningVO::courseName, Comparator.nullsLast(String::compareTo))
                        .thenComparing(AcademicWarningVO::teachingClassName, Comparator.nullsLast(String::compareTo)))
                .toList();
    }

    public DashboardVO dashboard() {
        CurrentUser user = SecurityUtils.currentUser();
        LambdaQueryWrapper<TeachingClass> classWrapper = new LambdaQueryWrapper<>();
        LambdaQueryWrapper<AcademicWarning> warningWrapper = new LambdaQueryWrapper<>();
        LambdaQueryWrapper<AttendanceRecord> attendanceWrapper = new LambdaQueryWrapper<AttendanceRecord>()
                .eq(AttendanceRecord::getAttendanceDate, LocalDate.now())
                .in(AttendanceRecord::getStatus, List.of("LATE", "EARLY_LEAVE", "ABSENT"));
        if (user.isTeacher()) {
            Long teacherId = accessService.currentTeacherId();
            List<Long> classIds = teachingClassMapper.selectList(new LambdaQueryWrapper<TeachingClass>()
                            .eq(TeachingClass::getTeacherId, teacherId))
                    .stream().map(TeachingClass::getId).toList();
            classWrapper.eq(TeachingClass::getTeacherId, teacherId);
            if (classIds.isEmpty()) {
                return new DashboardVO(user.userType(), user.realName(), true, 0, 0, 0, 0, List.of(), List.of());
            }
            warningWrapper.in(AcademicWarning::getTeachingClassId, classIds);
            attendanceWrapper.in(AttendanceRecord::getTeachingClassId, classIds);
        } else if (user.isStudent()) {
            Long studentId = accessService.currentStudentId();
            List<Long> classIds = enrollmentMapper.selectList(new LambdaQueryWrapper<TeachingClassStudent>()
                            .eq(TeachingClassStudent::getStudentId, studentId))
                    .stream().map(TeachingClassStudent::getTeachingClassId).toList();
            if (classIds.isEmpty()) {
                return new DashboardVO(user.userType(), user.realName(), false, 0, 0, 0, 0, List.of(), List.of());
            }
            classWrapper.in(TeachingClass::getId, classIds);
            warningWrapper.eq(AcademicWarning::getStudentId, studentId);
            attendanceWrapper.eq(AttendanceRecord::getStudentId, studentId);
        }
        long teachingClassCount = user.isStudent() ? 0 : teachingClassMapper.selectCount(classWrapper);
        long studentCount = scopedStudentCount(user);
        long abnormalCount = user.isStudent() ? 0 : attendanceMapper.selectCount(attendanceWrapper);
        LambdaQueryWrapper<AcademicWarning> highRiskWrapper = new LambdaQueryWrapper<AcademicWarning>()
                .eq(AcademicWarning::getWarningLevel, "HIGH")
                .eq(AcademicWarning::getStatus, "OPEN");
        if (user.isTeacher()) {
            Long teacherId = accessService.currentTeacherId();
            List<Long> classIds = teachingClassMapper.selectList(new LambdaQueryWrapper<TeachingClass>()
                            .eq(TeachingClass::getTeacherId, teacherId))
                    .stream().map(TeachingClass::getId).toList();
            highRiskWrapper.in(!classIds.isEmpty(), AcademicWarning::getTeachingClassId, classIds);
            highRiskWrapper.eq(classIds.isEmpty(), AcademicWarning::getTeachingClassId, -1L);
        } else if (user.isStudent()) {
            highRiskWrapper.eq(AcademicWarning::getStudentId, accessService.currentStudentId());
        }
        long highRiskCount = user.isStudent() ? 0 : warningMapper.selectCount(highRiskWrapper);
        List<AcademicWarning> recent = warningMapper.selectList(warningWrapper.orderByDesc(AcademicWarning::getGeneratedTime).last("limit 8"));
        return new DashboardVO(
                user.userType(),
                user.realName(),
                !user.isStudent(),
                teachingClassCount,
                studentCount,
                abnormalCount,
                highRiskCount,
                recent,
                dashboardTrends(user)
        );
    }

    private long scopedStudentCount(CurrentUser user) {
        if (user.isStudent()) {
            return 0;
        }
        if (user.isAdmin()) {
            return studentProfileMapper.selectCount(new LambdaQueryWrapper<>());
        }
        Long teacherId = accessService.currentTeacherId();
        List<Long> classIds = teachingClassMapper.selectList(new LambdaQueryWrapper<TeachingClass>()
                        .eq(TeachingClass::getTeacherId, teacherId))
                .stream().map(TeachingClass::getId).toList();
        if (classIds.isEmpty()) {
            return 0;
        }
        return enrollmentMapper.selectList(new LambdaQueryWrapper<TeachingClassStudent>()
                        .in(TeachingClassStudent::getTeachingClassId, classIds))
                .stream().map(TeachingClassStudent::getStudentId).distinct().count();
    }

    private List<TrendPointVO> dashboardTrends(CurrentUser user) {
        if (user.isStudent()) {
            return List.of();
        }
        List<Long> classIds = List.of();
        if (user.isTeacher()) {
            Long teacherId = accessService.currentTeacherId();
            classIds = teachingClassMapper.selectList(new LambdaQueryWrapper<TeachingClass>()
                            .eq(TeachingClass::getTeacherId, teacherId))
                    .stream().map(TeachingClass::getId).toList();
            if (classIds.isEmpty()) {
                return List.of();
            }
        }
        List<Long> scopedClassIds = classIds;
        LambdaQueryWrapper<AttendanceRecord> latestWrapper = new LambdaQueryWrapper<AttendanceRecord>()
                .orderByDesc(AttendanceRecord::getAttendanceDate)
                .last("limit 1");
        if (user.isTeacher()) {
            latestWrapper.in(AttendanceRecord::getTeachingClassId, scopedClassIds);
        }
        AttendanceRecord latest = attendanceMapper.selectOne(latestWrapper);
        LambdaQueryWrapper<AcademicWarning> latestWarningWrapper = new LambdaQueryWrapper<AcademicWarning>()
                .orderByDesc(AcademicWarning::getGeneratedTime)
                .last("limit 1");
        if (user.isTeacher()) {
            latestWarningWrapper.in(AcademicWarning::getTeachingClassId, scopedClassIds);
        }
        AcademicWarning latestWarning = warningMapper.selectOne(latestWarningWrapper);
        LocalDate latestAttendanceDate = latest == null ? null : latest.getAttendanceDate();
        LocalDate latestWarningDate = latestWarning == null ? null : latestWarning.getGeneratedTime().toLocalDate();
        LocalDate anchor = latestAttendanceDate == null ? latestWarningDate : latestWarningDate == null || latestAttendanceDate.isAfter(latestWarningDate) ? latestAttendanceDate : latestWarningDate;
        if (anchor == null) {
            anchor = LocalDate.now();
        }
        LocalDate finalAnchor = anchor;
        return java.util.stream.IntStream.rangeClosed(0, 6)
                .mapToObj(offset -> {
                    LocalDate day = finalAnchor.minusDays(6L - offset);
                    LambdaQueryWrapper<AttendanceRecord> attendance = new LambdaQueryWrapper<AttendanceRecord>()
                            .eq(AttendanceRecord::getAttendanceDate, day)
                            .in(AttendanceRecord::getStatus, List.of("LATE", "EARLY_LEAVE", "ABSENT"));
                    LambdaQueryWrapper<AcademicWarning> warning = new LambdaQueryWrapper<AcademicWarning>()
                            .ge(AcademicWarning::getGeneratedTime, day.atStartOfDay())
                            .lt(AcademicWarning::getGeneratedTime, day.plusDays(1).atStartOfDay());
                    LambdaQueryWrapper<AttendanceRecord> absent = new LambdaQueryWrapper<AttendanceRecord>()
                            .eq(AttendanceRecord::getAttendanceDate, day)
                            .eq(AttendanceRecord::getStatus, "ABSENT");
                    if (user.isTeacher()) {
                        attendance.in(AttendanceRecord::getTeachingClassId, scopedClassIds);
                        warning.in(AcademicWarning::getTeachingClassId, scopedClassIds);
                        absent.in(AttendanceRecord::getTeachingClassId, scopedClassIds);
                    }
                    return new TrendPointVO(
                            day.getMonthValue() + "/" + day.getDayOfMonth(),
                            attendanceMapper.selectCount(attendance),
                            warningMapper.selectCount(warning),
                            attendanceMapper.selectCount(absent)
                    );
                }).toList();
    }

    private void assertEnrollmentAndScope(Long teachingClassId, Long studentId) {
        accessService.assertClassScope(teachingClassId);
        accessService.assertStudentScope(studentId);
        Long count = enrollmentMapper.selectCount(new LambdaQueryWrapper<TeachingClassStudent>()
                .eq(TeachingClassStudent::getTeachingClassId, teachingClassId)
                .eq(TeachingClassStudent::getStudentId, studentId));
        if (count == 0) {
            throw new BizException(400, "学生不在该教学班名单中");
        }
    }

    private boolean canSeePair(CurrentUser user, Long teachingClassId, Long studentId) {
        if (user.isAdmin()) {
            return true;
        }
        if (user.isStudent()) {
            return accessService.currentStudentId().equals(studentId);
        }
        return user.isTeacher() && accessService.requireTeachingClass(teachingClassId).getTeacherId().equals(accessService.currentTeacherId());
    }

    private void applyGradeScope(LambdaQueryWrapper<GradeRecord> wrapper) {
        CurrentUser user = SecurityUtils.currentUser();
        if (user.isTeacher()) {
            Long teacherId = accessService.currentTeacherId();
            List<Long> classIds = teachingClassMapper.selectList(new LambdaQueryWrapper<TeachingClass>()
                            .eq(TeachingClass::getTeacherId, teacherId))
                    .stream().map(TeachingClass::getId).toList();
            wrapper.in(!classIds.isEmpty(), GradeRecord::getTeachingClassId, classIds);
            wrapper.eq(classIds.isEmpty(), GradeRecord::getTeachingClassId, -1L);
        } else if (user.isStudent()) {
            wrapper.eq(GradeRecord::getStudentId, accessService.currentStudentId());
        }
    }

    private void applyAttendanceScope(LambdaQueryWrapper<AttendanceRecord> wrapper) {
        CurrentUser user = SecurityUtils.currentUser();
        if (user.isTeacher()) {
            Long teacherId = accessService.currentTeacherId();
            List<Long> classIds = teachingClassMapper.selectList(new LambdaQueryWrapper<TeachingClass>()
                            .eq(TeachingClass::getTeacherId, teacherId))
                    .stream().map(TeachingClass::getId).toList();
            wrapper.in(!classIds.isEmpty(), AttendanceRecord::getTeachingClassId, classIds);
            wrapper.eq(classIds.isEmpty(), AttendanceRecord::getTeachingClassId, -1L);
        } else if (user.isStudent()) {
            wrapper.eq(AttendanceRecord::getStudentId, accessService.currentStudentId());
        }
    }

    private void applyWarningScope(LambdaQueryWrapper<AcademicWarning> wrapper) {
        CurrentUser user = SecurityUtils.currentUser();
        if (user.isTeacher()) {
            Long teacherId = accessService.currentTeacherId();
            List<Long> classIds = teachingClassMapper.selectList(new LambdaQueryWrapper<TeachingClass>()
                            .eq(TeachingClass::getTeacherId, teacherId))
                    .stream().map(TeachingClass::getId).toList();
            wrapper.in(!classIds.isEmpty(), AcademicWarning::getTeachingClassId, classIds);
            wrapper.eq(classIds.isEmpty(), AcademicWarning::getTeachingClassId, -1L);
        } else if (user.isStudent()) {
            wrapper.eq(AcademicWarning::getStudentId, accessService.currentStudentId());
        }
    }

    private void assertAttendanceStatus(String status) {
        if (!List.of("NORMAL", "LATE", "EARLY_LEAVE", "LEAVE", "ABSENT").contains(status)) {
            throw new BizException(400, "考勤状态不合法");
        }
    }

    private TeachingClassVO toTeachingClassVO(TeachingClass teachingClass) {
        Semester semester = semesterMapper.selectById(teachingClass.getSemesterId());
        Course course = courseMapper.selectById(teachingClass.getCourseId());
        TeacherProfile teacher = teacherProfileMapper.selectById(teachingClass.getTeacherId());
        SysUser teacherUser = teacher == null ? null : userMapper.selectById(teacher.getUserId());
        return new TeachingClassVO(
                teachingClass.getId(),
                teachingClass.getClassName(),
                semester == null ? "-" : semester.getName(),
                course == null ? "-" : course.getName(),
                teacherUser == null ? "-" : teacherUser.getRealName(),
                teachingClass.getCapacity()
        );
    }

    private TeacherProfileVO toTeacherProfileVO(TeacherProfile teacher) {
        SysUser user = teacher == null ? null : userMapper.selectById(teacher.getUserId());
        College college = teacher == null || teacher.getCollegeId() == null ? null : collegeMapper.selectById(teacher.getCollegeId());
        return new TeacherProfileVO(
                teacher == null ? null : teacher.getId(),
                teacher == null ? "-" : teacher.getTeacherNo(),
                user == null ? "-" : user.getRealName(),
                college == null ? "-" : college.getName(),
                teacher == null ? "-" : teacher.getDepartment(),
                teacher == null ? "-" : teacher.getTitle()
        );
    }

    private StudentProfileVO toStudentProfileVO(StudentProfile student) {
        SysUser user = student == null ? null : userMapper.selectById(student.getUserId());
        Major major = student == null || student.getMajorId() == null ? null : majorMapper.selectById(student.getMajorId());
        AdminClass adminClass = student == null || student.getAdminClassId() == null ? null : adminClassMapper.selectById(student.getAdminClassId());
        College college = major == null ? null : collegeMapper.selectById(major.getCollegeId());
        return new StudentProfileVO(
                student == null ? null : student.getId(),
                student == null ? "-" : student.getStudentNo(),
                user == null ? "-" : user.getRealName(),
                college == null ? "-" : college.getName(),
                major == null ? student == null ? "-" : student.getMajor() : major.getName(),
                adminClass == null ? student == null ? "-" : student.getClassName() : adminClass.getClassName(),
                student == null ? null : student.getGradeYear()
        );
    }

    private EnrollmentVO toEnrollmentVO(TeachingClassStudent enrollment) {
        TeachingClass teachingClass = teachingClassMapper.selectById(enrollment.getTeachingClassId());
        StudentProfile student = studentProfileMapper.selectById(enrollment.getStudentId());
        SysUser studentUser = student == null ? null : userMapper.selectById(student.getUserId());
        return new EnrollmentVO(
                enrollment.getId(),
                teachingClass == null ? "-" : teachingClass.getClassName(),
                studentUser == null ? "-" : studentUser.getRealName(),
                student == null ? "-" : student.getStudentNo(),
                student == null ? "-" : student.getMajor(),
                student == null ? "-" : student.getClassName()
        );
    }

    private GradeRecordVO toGradeVO(GradeRecord record) {
        TeachingClass teachingClass = teachingClassMapper.selectById(record.getTeachingClassId());
        Course course = teachingClass == null ? null : courseMapper.selectById(teachingClass.getCourseId());
        Semester semester = teachingClass == null ? null : semesterMapper.selectById(teachingClass.getSemesterId());
        StudentProfile student = studentProfileMapper.selectById(record.getStudentId());
        SysUser studentUser = student == null ? null : userMapper.selectById(student.getUserId());
        return new GradeRecordVO(
                record.getId(),
                semester == null ? "-" : semester.getName(),
                teachingClass == null ? "-" : teachingClass.getClassName(),
                course == null ? "-" : course.getName(),
                student == null ? "-" : student.getStudentNo(),
                studentUser == null ? "-" : studentUser.getRealName(),
                record.getRegularScore(),
                record.getFinalScore(),
                record.getTotalScore()
        );
    }

    private AttendanceRecordVO toAttendanceVO(AttendanceRecord record) {
        TeachingClass teachingClass = teachingClassMapper.selectById(record.getTeachingClassId());
        Course course = teachingClass == null ? null : courseMapper.selectById(teachingClass.getCourseId());
        Semester semester = teachingClass == null ? null : semesterMapper.selectById(teachingClass.getSemesterId());
        TeacherProfile teacher = teachingClass == null ? null : teacherProfileMapper.selectById(teachingClass.getTeacherId());
        SysUser teacherUser = teacher == null ? null : userMapper.selectById(teacher.getUserId());
        StudentProfile student = studentProfileMapper.selectById(record.getStudentId());
        SysUser studentUser = student == null ? null : userMapper.selectById(student.getUserId());
        AdminClass adminClass = student == null || student.getAdminClassId() == null ? null : adminClassMapper.selectById(student.getAdminClassId());
        Integer weekNo = semester == null ? null : resolveWeekNo(semester, record.getAttendanceDate());
        List<ClassSchedule> schedules = classScheduleMapper.selectList(new LambdaQueryWrapper<ClassSchedule>()
                .eq(ClassSchedule::getTeachingClassId, record.getTeachingClassId()))
                .stream()
                .filter(item -> item.getDayOfWeek() != null && item.getDayOfWeek().equals(record.getAttendanceDate().getDayOfWeek().getValue()))
                .filter(item -> weekNo == null || (item.getStartWeek() != null && item.getEndWeek() != null && weekNo >= item.getStartWeek() && weekNo <= item.getEndWeek()))
                .sorted(Comparator.comparing(ClassSchedule::getStartSection))
                .toList();
        return new AttendanceRecordVO(
                record.getId(),
                adminClass == null ? student == null ? "-" : student.getClassName() : adminClass.getClassName(),
                student == null ? "-" : student.getStudentNo(),
                studentUser == null ? "-" : studentUser.getRealName(),
                course == null ? "-" : course.getName(),
                semester == null ? "-" : semester.getName(),
                teachingClass == null ? "-" : teachingClass.getClassName(),
                record.getAttendanceDate(),
                weekNo == null ? "-" : "第" + weekNo + "周",
                teacherUser == null ? "-" : teacherUser.getRealName(),
                joinSections(schedules),
                joinClassrooms(schedules),
                record.getStatus(),
                attendanceStatusText(record.getStatus()),
                record.getRemark()
        );
    }

    private AcademicWarningVO toWarningVO(AcademicWarning warning) {
        TeachingClass teachingClass = warning.getTeachingClassId() == null ? null : teachingClassMapper.selectById(warning.getTeachingClassId());
        Course course = teachingClass == null ? null : courseMapper.selectById(teachingClass.getCourseId());
        StudentProfile student = studentProfileMapper.selectById(warning.getStudentId());
        SysUser studentUser = student == null ? null : userMapper.selectById(student.getUserId());
        WarningCounts counts = warningCounts(warning.getTeachingClassId(), warning.getStudentId());
        return new AcademicWarningVO(
                warning.getId(),
                teachingClass == null ? "-" : teachingClass.getClassName(),
                course == null ? "-" : course.getName(),
                student == null ? "-" : student.getStudentNo(),
                studentUser == null ? "-" : studentUser.getRealName(),
                warning.getWarningLevel(),
                warningLevelText(warning.getWarningLevel()),
                counts.absentCount(),
                counts.lateOrEarlyCount(),
                warning.getReason(),
                warning.getGeneratedTime()
        );
    }

    private WarningCounts warningCounts(Long teachingClassId, Long studentId) {
        List<AttendanceRecord> records = attendanceMapper.selectList(new LambdaQueryWrapper<AttendanceRecord>()
                .eq(AttendanceRecord::getTeachingClassId, teachingClassId)
                .eq(AttendanceRecord::getStudentId, studentId));
        long absent = records.stream().filter(record -> "ABSENT".equals(record.getStatus())).count();
        long lateOrEarly = records.stream().filter(record -> "LATE".equals(record.getStatus()) || "EARLY_LEAVE".equals(record.getStatus())).count();
        return new WarningCounts(absent, lateOrEarly);
    }

    private record WarningCounts(long absentCount, long lateOrEarlyCount) {
    }

    private String attendanceStatusText(String status) {
        return switch (status) {
            case "NORMAL" -> "正常";
            case "LATE" -> "迟到";
            case "EARLY_LEAVE" -> "早退";
            case "LEAVE" -> "请假";
            case "ABSENT" -> "旷课";
            default -> status;
        };
    }

    private String warningLevelText(String level) {
        return switch (level) {
            case "LOW" -> "低风险";
            case "MEDIUM" -> "中风险";
            case "HIGH" -> "高风险";
            default -> level;
        };
    }

    private <T> PageResult<T> paginate(List<T> rows, PageRequest request) {
        long size = request.size() <= 0 ? 10 : request.size();
        long page = request.page() <= 0 ? 1 : request.page();
        int from = (int) Math.min(rows.size(), (page - 1) * size);
        int to = (int) Math.min(rows.size(), from + size);
        return new PageResult<>(rows.size(), page, size, rows.subList(from, to));
    }

    private boolean containsAny(String keyword, String... values) {
        String normalized = keyword == null ? "" : keyword.trim().toLowerCase();
        if (normalized.isEmpty()) {
            return true;
        }
        for (String value : values) {
            if (value != null && value.toLowerCase().contains(normalized)) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesSemester(String semesterName, PageRequest request) {
        if (!StringUtils.hasText(request.academicYear()) || request.term() == null) {
            return true;
        }
        return (request.academicYear() + "-" + request.term()).equals(semesterName);
    }

    private void applySemesterFilter(LambdaQueryWrapper<TeachingClass> wrapper, PageRequest request) {
        if (!StringUtils.hasText(request.academicYear()) || request.term() == null) {
            return;
        }
        String semesterName = request.academicYear() + "-" + request.term();
        List<Long> semesterIds = semesterMapper.selectList(new LambdaQueryWrapper<Semester>()
                        .eq(Semester::getName, semesterName))
                .stream()
                .map(Semester::getId)
                .toList();
        if (semesterIds.isEmpty()) {
            wrapper.eq(TeachingClass::getSemesterId, -1L);
            return;
        }
        wrapper.in(TeachingClass::getSemesterId, semesterIds);
    }

    private Integer resolveWeekNo(Semester semester, LocalDate attendanceDate) {
        if (semester.getStartDate() == null || attendanceDate == null || attendanceDate.isBefore(semester.getStartDate()) || attendanceDate.isAfter(semester.getEndDate())) {
            return null;
        }
        return (int) ChronoUnit.WEEKS.between(semester.getStartDate(), attendanceDate) + 1;
    }

    private String joinSections(List<ClassSchedule> schedules) {
        if (schedules.isEmpty()) {
            return "-";
        }
        return schedules.stream()
                .map(item -> "第" + item.getStartSection() + "-" + item.getEndSection() + "节")
                .distinct()
                .reduce((left, right) -> left + "、" + right)
                .orElse("-");
    }

    private String joinClassrooms(List<ClassSchedule> schedules) {
        if (schedules.isEmpty()) {
            return "-";
        }
        Set<String> classrooms = new LinkedHashSet<>();
        schedules.stream().map(ClassSchedule::getClassroom).filter(StringUtils::hasText).forEach(classrooms::add);
        return classrooms.isEmpty() ? "-" : String.join("、", classrooms);
    }

}
