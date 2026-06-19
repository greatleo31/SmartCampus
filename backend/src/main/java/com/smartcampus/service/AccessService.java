package com.smartcampus.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.smartcampus.domain.StudentProfile;
import com.smartcampus.domain.TeacherProfile;
import com.smartcampus.domain.TeachingClass;
import com.smartcampus.domain.TeachingClassStudent;
import com.smartcampus.exception.BizException;
import com.smartcampus.mapper.StudentProfileMapper;
import com.smartcampus.mapper.TeacherProfileMapper;
import com.smartcampus.mapper.TeachingClassMapper;
import com.smartcampus.mapper.TeachingClassStudentMapper;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccessService {
    private final TeacherProfileMapper teacherProfileMapper;
    private final StudentProfileMapper studentProfileMapper;
    private final TeachingClassMapper teachingClassMapper;
    private final TeachingClassStudentMapper enrollmentMapper;

    public Long currentTeacherId() {
        CurrentUser user = SecurityUtils.currentUser();
        TeacherProfile profile = teacherProfileMapper.selectOne(new LambdaQueryWrapper<TeacherProfile>()
                .eq(TeacherProfile::getUserId, user.id()));
        if (profile == null) {
            throw new BizException(403, "当前用户没有教师档案");
        }
        return profile.getId();
    }

    public Long currentStudentId() {
        CurrentUser user = SecurityUtils.currentUser();
        StudentProfile profile = studentProfileMapper.selectOne(new LambdaQueryWrapper<StudentProfile>()
                .eq(StudentProfile::getUserId, user.id()));
        if (profile == null) {
            throw new BizException(403, "当前用户没有学生档案");
        }
        return profile.getId();
    }

    public TeachingClass requireTeachingClass(Long teachingClassId) {
        TeachingClass teachingClass = teachingClassMapper.selectById(teachingClassId);
        if (teachingClass == null) {
            throw new BizException(404, "教学班不存在");
        }
        return teachingClass;
    }

    public void assertClassScope(Long teachingClassId) {
        CurrentUser user = SecurityUtils.currentUser();
        if (user.isAdmin()) {
            return;
        }
        TeachingClass teachingClass = requireTeachingClass(teachingClassId);
        if (user.isTeacher() && teachingClass.getTeacherId().equals(currentTeacherId())) {
            return;
        }
        if (user.isStudent()) {
            Long studentId = currentStudentId();
            Long count = enrollmentMapper.selectCount(new LambdaQueryWrapper<TeachingClassStudent>()
                    .eq(TeachingClassStudent::getTeachingClassId, teachingClassId)
                    .eq(TeachingClassStudent::getStudentId, studentId));
            if (count > 0) {
                return;
            }
        }
        throw new BizException(403, "无权访问该教学班");
    }

    public void assertStudentScope(Long studentId) {
        CurrentUser user = SecurityUtils.currentUser();
        if (user.isAdmin()) {
            return;
        }
        if (user.isStudent() && currentStudentId().equals(studentId)) {
            return;
        }
        if (user.isTeacher()) {
            Long teacherId = currentTeacherId();
            List<Long> classIds = teachingClassMapper.selectList(new LambdaQueryWrapper<TeachingClass>()
                            .eq(TeachingClass::getTeacherId, teacherId))
                    .stream().map(TeachingClass::getId).toList();
            if (classIds.isEmpty()) {
                throw new BizException(403, "无权访问该学生数据");
            }
            Long count = enrollmentMapper.selectCount(new LambdaQueryWrapper<TeachingClassStudent>()
                    .eq(TeachingClassStudent::getStudentId, studentId)
                    .in(TeachingClassStudent::getTeachingClassId, classIds));
            if (count > 0) {
                return;
            }
        }
        throw new BizException(403, "无权访问该学生数据");
    }
}
