package com.smartcampus.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.smartcampus.common.ApiResponse;
import com.smartcampus.domain.StudentProfile;
import com.smartcampus.domain.TeacherProfile;
import com.smartcampus.domain.TeachingClass;
import com.smartcampus.domain.TeachingClassStudent;
import com.smartcampus.mapper.StudentProfileMapper;
import com.smartcampus.mapper.TeacherProfileMapper;
import com.smartcampus.mapper.TeachingClassMapper;
import com.smartcampus.mapper.TeachingClassStudentMapper;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.security.SecurityUtils;
import com.smartcampus.service.AccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProfileController {
    private final TeacherProfileMapper teacherProfileMapper;
    private final StudentProfileMapper studentProfileMapper;
    private final TeachingClassMapper teachingClassMapper;
    private final TeachingClassStudentMapper enrollmentMapper;
    private final AccessService accessService;

    @GetMapping("/api/teachers")
    @PreAuthorize("hasAuthority('class:manage')")
    public ApiResponse<List<TeacherProfile>> teachers() {
        return ApiResponse.ok(teacherProfileMapper.selectList(new LambdaQueryWrapper<TeacherProfile>()
                .orderByDesc(TeacherProfile::getId)));
    }

    @GetMapping("/api/students")
    @PreAuthorize("hasAuthority('enrollment:manage') or hasAuthority('grade:manage') or hasAuthority('attendance:manage')")
    public ApiResponse<List<StudentProfile>> students() {
        CurrentUser user = SecurityUtils.currentUser();
        if (user.isAdmin()) {
            return ApiResponse.ok(studentProfileMapper.selectList(new LambdaQueryWrapper<StudentProfile>()
                    .orderByDesc(StudentProfile::getId)));
        }
        Long teacherId = accessService.currentTeacherId();
        List<Long> classIds = teachingClassMapper.selectList(new LambdaQueryWrapper<TeachingClass>()
                        .eq(TeachingClass::getTeacherId, teacherId))
                .stream().map(TeachingClass::getId).toList();
        if (classIds.isEmpty()) {
            return ApiResponse.ok(List.of());
        }
        List<Long> studentIds = enrollmentMapper.selectList(new LambdaQueryWrapper<TeachingClassStudent>()
                        .in(TeachingClassStudent::getTeachingClassId, classIds))
                .stream().map(TeachingClassStudent::getStudentId).distinct().toList();
        if (studentIds.isEmpty()) {
            return ApiResponse.ok(List.of());
        }
        return ApiResponse.ok(studentProfileMapper.selectList(new LambdaQueryWrapper<StudentProfile>()
                .in(StudentProfile::getId, studentIds)
                .orderByDesc(StudentProfile::getId)));
    }
}
