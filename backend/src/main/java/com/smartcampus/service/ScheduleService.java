package com.smartcampus.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.smartcampus.domain.*;
import com.smartcampus.dto.ClassScheduleRequest;
import com.smartcampus.exception.BizException;
import com.smartcampus.mapper.*;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.security.SecurityUtils;
import com.smartcampus.vo.ScheduleItemVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ScheduleService {
    private final AccessService accessService;
    private final ClassScheduleMapper scheduleMapper;
    private final TeachingClassMapper teachingClassMapper;
    private final TeachingClassStudentMapper enrollmentMapper;
    private final StudentProfileMapper studentProfileMapper;
    private final CourseMapper courseMapper;
    private final SemesterMapper semesterMapper;
    private final TeacherProfileMapper teacherProfileMapper;
    private final SysUserMapper userMapper;

    public List<ScheduleItemVO> mySchedules() {
        CurrentUser user = SecurityUtils.currentUser();
        if (user.isAdmin()) {
            return loadSchedulesByClassIds(null);
        }
        if (user.isTeacher()) {
            Long teacherId = accessService.currentTeacherId();
            List<Long> classIds = teachingClassMapper.selectList(new LambdaQueryWrapper<TeachingClass>()
                            .eq(TeachingClass::getTeacherId, teacherId))
                    .stream().map(TeachingClass::getId).toList();
            return loadSchedulesByClassIds(classIds);
        }
        Long studentId = accessService.currentStudentId();
        List<Long> classIds = enrollmentMapper.selectList(new LambdaQueryWrapper<TeachingClassStudent>()
                        .eq(TeachingClassStudent::getStudentId, studentId))
                .stream().map(TeachingClassStudent::getTeachingClassId).toList();
        return loadSchedulesByClassIds(classIds);
    }

    public List<ScheduleItemVO> classSchedules() {
        CurrentUser user = SecurityUtils.currentUser();
        if (!user.isStudent()) {
            return mySchedules();
        }
        StudentProfile current = studentProfileMapper.selectById(accessService.currentStudentId());
        if (current == null || current.getAdminClassId() == null) {
            return List.of();
        }
        List<Long> studentIds = studentProfileMapper.selectList(new LambdaQueryWrapper<StudentProfile>()
                        .eq(StudentProfile::getAdminClassId, current.getAdminClassId()))
                .stream()
                .map(StudentProfile::getId)
                .filter(Objects::nonNull)
                .toList();
        if (studentIds.isEmpty()) {
            return List.of();
        }
        List<Long> classIds = enrollmentMapper.selectList(new LambdaQueryWrapper<TeachingClassStudent>()
                        .in(TeachingClassStudent::getStudentId, studentIds))
                .stream()
                .map(TeachingClassStudent::getTeachingClassId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        return loadSchedulesByClassIds(classIds);
    }

    public List<ScheduleItemVO> all() {
        return toVO(scheduleMapper.selectList(new LambdaQueryWrapper<ClassSchedule>()
                .orderByAsc(ClassSchedule::getDayOfWeek)
                .orderByAsc(ClassSchedule::getStartSection)));
    }

    public ClassSchedule save(Long id, ClassScheduleRequest request) {
        if (request.endSection() < request.startSection() || request.endWeek() < request.startWeek()) {
            throw new BizException(400, "课表节次或周次范围不合法");
        }
        accessService.requireTeachingClass(request.teachingClassId());
        ClassSchedule schedule = id == null ? new ClassSchedule() : require(id);
        schedule.setTeachingClassId(request.teachingClassId());
        schedule.setDayOfWeek(request.dayOfWeek());
        schedule.setStartSection(request.startSection());
        schedule.setEndSection(request.endSection());
        schedule.setStartWeek(request.startWeek());
        schedule.setEndWeek(request.endWeek());
        schedule.setClassroom(request.classroom());
        schedule.setLocation(request.location());
        if (id == null) {
            scheduleMapper.insert(schedule);
        } else {
            scheduleMapper.updateById(schedule);
        }
        return schedule;
    }

    public void delete(Long id) {
        require(id);
        scheduleMapper.deleteById(id);
    }

    private ClassSchedule require(Long id) {
        ClassSchedule schedule = scheduleMapper.selectById(id);
        if (schedule == null) {
            throw new BizException(404, "课表记录不存在");
        }
        return schedule;
    }

    private List<ScheduleItemVO> loadSchedulesByClassIds(List<Long> classIds) {
        LambdaQueryWrapper<ClassSchedule> wrapper = new LambdaQueryWrapper<ClassSchedule>()
                .orderByAsc(ClassSchedule::getDayOfWeek)
                .orderByAsc(ClassSchedule::getStartSection);
        if (classIds != null) {
            if (classIds.isEmpty()) {
                return List.of();
            }
            wrapper.in(ClassSchedule::getTeachingClassId, classIds);
        }
        return toVO(scheduleMapper.selectList(wrapper));
    }

    private List<ScheduleItemVO> toVO(List<ClassSchedule> schedules) {
        return schedules.stream().map(schedule -> {
            TeachingClass teachingClass = teachingClassMapper.selectById(schedule.getTeachingClassId());
            Course course = teachingClass == null ? null : courseMapper.selectById(teachingClass.getCourseId());
            Semester semester = teachingClass == null ? null : semesterMapper.selectById(teachingClass.getSemesterId());
            TeacherProfile teacher = teachingClass == null ? null : teacherProfileMapper.selectById(teachingClass.getTeacherId());
            SysUser teacherUser = teacher == null ? null : userMapper.selectById(teacher.getUserId());
            return new ScheduleItemVO(
                    schedule.getId(),
                    schedule.getTeachingClassId(),
                    semester == null ? "-" : semester.getName(),
                    teachingClass == null ? "-" : teachingClass.getClassName(),
                    course == null ? "-" : course.getName(),
                    teacherUser == null ? "-" : teacherUser.getRealName(),
                    schedule.getDayOfWeek(),
                    schedule.getStartSection(),
                    schedule.getEndSection(),
                    schedule.getStartWeek(),
                    schedule.getEndWeek(),
                    schedule.getClassroom(),
                    schedule.getLocation()
            );
        }).toList();
    }
}
