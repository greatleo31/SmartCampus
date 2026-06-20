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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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

    public PageResult<TeachingClass> teachingClasses(PageRequest request) {
        CurrentUser user = SecurityUtils.currentUser();
        LambdaQueryWrapper<TeachingClass> wrapper = new LambdaQueryWrapper<TeachingClass>()
                .and(StringUtils.hasText(request.keyword()), w -> w
                        .like(TeachingClass::getClassName, request.keyword())
                        .or()
                        .like(TeachingClass::getClassCode, request.keyword()))
                .orderByDesc(TeachingClass::getId);
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
        return new PageResult<>(page.getTotal(), page.getCurrent(), page.getSize(), page.getRecords());
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

    public List<TeachingClassStudent> enrollments(Long teachingClassId) {
        accessService.assertClassScope(teachingClassId);
        return enrollmentMapper.selectList(new LambdaQueryWrapper<TeachingClassStudent>()
                .eq(TeachingClassStudent::getTeachingClassId, teachingClassId)
                .orderByDesc(TeachingClassStudent::getId));
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

    @Transactional
    public int recalculateWarnings() {
        CurrentUser user = SecurityUtils.currentUser();
        List<TeachingClassStudent> enrollments = enrollmentMapper.selectList(new LambdaQueryWrapper<TeachingClassStudent>());
        int generated = 0;
        for (TeachingClassStudent enrollment : enrollments) {
            if (!canSeePair(user, enrollment.getTeachingClassId(), enrollment.getStudentId())) {
                continue;
            }
            GradeRecord grade = gradeMapper.selectOne(new LambdaQueryWrapper<GradeRecord>()
                    .eq(GradeRecord::getTeachingClassId, enrollment.getTeachingClassId())
                    .eq(GradeRecord::getStudentId, enrollment.getStudentId()));
            List<AttendanceRecord> records = attendanceMapper.selectList(new LambdaQueryWrapper<AttendanceRecord>()
                    .eq(AttendanceRecord::getTeachingClassId, enrollment.getTeachingClassId())
                    .eq(AttendanceRecord::getStudentId, enrollment.getStudentId()));
            long absent = records.stream().filter(r -> "ABSENT".equals(r.getStatus())).count();
            long lateOrEarly = records.stream().filter(r -> "LATE".equals(r.getStatus()) || "EARLY_LEAVE".equals(r.getStatus())).count();
            WarningRuleEngine.WarningDecision decision = WarningRuleEngine.evaluate(
                    grade == null ? null : grade.getTotalScore(), absent, lateOrEarly);
            if (decision.hasWarning()) {
                AcademicWarning warning = new AcademicWarning();
                warning.setTeachingClassId(enrollment.getTeachingClassId());
                warning.setStudentId(enrollment.getStudentId());
                warning.setWarningLevel(decision.level());
                warning.setReason(decision.reason());
                warning.setStatus("OPEN");
                warning.setGeneratedTime(LocalDateTime.now());
                warningMapper.insert(warning);
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
        return warningMapper.selectList(wrapper);
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
        return java.util.stream.IntStream.rangeClosed(0, 6)
                .mapToObj(offset -> {
                    LocalDate day = LocalDate.now().minusDays(6L - offset);
                    LambdaQueryWrapper<AttendanceRecord> attendance = new LambdaQueryWrapper<AttendanceRecord>()
                            .eq(AttendanceRecord::getAttendanceDate, day)
                            .in(AttendanceRecord::getStatus, List.of("LATE", "EARLY_LEAVE", "ABSENT"));
                    LambdaQueryWrapper<AcademicWarning> warning = new LambdaQueryWrapper<AcademicWarning>()
                            .ge(AcademicWarning::getGeneratedTime, day.atStartOfDay())
                            .lt(AcademicWarning::getGeneratedTime, day.plusDays(1).atStartOfDay());
                    LambdaQueryWrapper<GradeRecord> lowScore = new LambdaQueryWrapper<GradeRecord>()
                            .lt(GradeRecord::getTotalScore, 60);
                    if (user.isTeacher()) {
                        attendance.in(AttendanceRecord::getTeachingClassId, scopedClassIds);
                        warning.in(AcademicWarning::getTeachingClassId, scopedClassIds);
                        lowScore.in(GradeRecord::getTeachingClassId, scopedClassIds);
                    }
                    return new TrendPointVO(
                            day.getMonthValue() + "/" + day.getDayOfMonth(),
                            attendanceMapper.selectCount(attendance),
                            warningMapper.selectCount(warning),
                            gradeMapper.selectCount(lowScore)
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
}
