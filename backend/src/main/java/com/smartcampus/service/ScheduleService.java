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

@Service
@RequiredArgsConstructor
public class ScheduleService {
    private final AccessService accessService;
    private final ClassScheduleMapper scheduleMapper;
    private final TeachingClassMapper teachingClassMapper;
    private final TeachingClassStudentMapper enrollmentMapper;
    private final CourseMapper courseMapper;
    private final TeacherProfileMapper teacherProfileMapper;
    private final SysUserMapper userMapper;

    public List<ScheduleItemVO> mySchedules() {
        CurrentUser user = SecurityUtils.currentUser();
        if (user.isAdmin()) {
            return toVO(scheduleMapper.selectList(new LambdaQueryWrapper<ClassSchedule>()
                    .orderByAsc(ClassSchedule::getDayOfWeek)
                    .orderByAsc(ClassSchedule::getStartSection)));
        }
        if (user.isTeacher()) {
            Long teacherId = accessService.currentTeacherId();
            List<Long> classIds = teachingClassMapper.selectList(new LambdaQueryWrapper<TeachingClass>()
                            .eq(TeachingClass::getTeacherId, teacherId))
                    .stream().map(TeachingClass::getId).toList();
            if (classIds.isEmpty()) {
                return List.of();
            }
            return toVO(scheduleMapper.selectList(new LambdaQueryWrapper<ClassSchedule>()
                    .in(ClassSchedule::getTeachingClassId, classIds)
                    .orderByAsc(ClassSchedule::getDayOfWeek)
                    .orderByAsc(ClassSchedule::getStartSection)));
        }
        Long studentId = accessService.currentStudentId();
        List<Long> classIds = enrollmentMapper.selectList(new LambdaQueryWrapper<TeachingClassStudent>()
                        .eq(TeachingClassStudent::getStudentId, studentId))
                .stream().map(TeachingClassStudent::getTeachingClassId).toList();
        if (classIds.isEmpty()) {
            return List.of();
        }
        return toVO(scheduleMapper.selectList(new LambdaQueryWrapper<ClassSchedule>()
                .in(ClassSchedule::getTeachingClassId, classIds)
                .orderByAsc(ClassSchedule::getDayOfWeek)
                .orderByAsc(ClassSchedule::getStartSection)));
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

    private List<ScheduleItemVO> toVO(List<ClassSchedule> schedules) {
        return schedules.stream().map(schedule -> {
            TeachingClass teachingClass = teachingClassMapper.selectById(schedule.getTeachingClassId());
            Course course = teachingClass == null ? null : courseMapper.selectById(teachingClass.getCourseId());
            TeacherProfile teacher = teachingClass == null ? null : teacherProfileMapper.selectById(teachingClass.getTeacherId());
            SysUser teacherUser = teacher == null ? null : userMapper.selectById(teacher.getUserId());
            return new ScheduleItemVO(
                    schedule.getId(),
                    schedule.getTeachingClassId(),
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
