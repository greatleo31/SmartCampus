package com.smartcampus.controller;

import com.smartcampus.common.ApiResponse;
import com.smartcampus.common.PageRequest;
import com.smartcampus.common.PageResult;
import com.smartcampus.domain.*;
import com.smartcampus.dto.AttendanceRequest;
import com.smartcampus.dto.EnrollmentRequest;
import com.smartcampus.dto.GradeRequest;
import com.smartcampus.dto.TeachingClassRequest;
import com.smartcampus.security.SecurityUtils;
import com.smartcampus.service.TeachingService;
import com.smartcampus.vo.DashboardVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TeachingController {
    private final TeachingService teachingService;

    @GetMapping("/api/dashboard/overview")
    @PreAuthorize("hasAuthority('dashboard:view')")
    public ApiResponse<DashboardVO> dashboard() {
        return ApiResponse.ok(teachingService.dashboard());
    }

    @GetMapping("/api/teaching-classes")
    @PreAuthorize("hasAuthority('class:manage') or hasAuthority('grade:manage') or hasAuthority('attendance:manage') or hasAuthority('student:course:view')")
    public ApiResponse<PageResult<TeachingClass>> teachingClasses(@Valid PageRequest request) {
        return ApiResponse.ok(teachingService.teachingClasses(request));
    }

    @PostMapping("/api/teaching-classes")
    @PreAuthorize("hasAuthority('class:manage')")
    public ApiResponse<TeachingClass> createTeachingClass(@Valid @RequestBody TeachingClassRequest request) {
        return ApiResponse.ok(teachingService.saveTeachingClass(null, request));
    }

    @PutMapping("/api/teaching-classes/{id}")
    @PreAuthorize("hasAuthority('class:manage')")
    public ApiResponse<TeachingClass> updateTeachingClass(@PathVariable Long id, @Valid @RequestBody TeachingClassRequest request) {
        return ApiResponse.ok(teachingService.saveTeachingClass(id, request));
    }

    @DeleteMapping("/api/teaching-classes/{id}")
    @PreAuthorize("hasAuthority('class:manage')")
    public ApiResponse<Void> deleteTeachingClass(@PathVariable Long id) {
        teachingService.deleteTeachingClass(id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/api/enrollments")
    @PreAuthorize("hasAuthority('enrollment:manage') or hasAuthority('grade:manage') or hasAuthority('attendance:manage')")
    public ApiResponse<List<TeachingClassStudent>> enrollments(@RequestParam Long teachingClassId) {
        return ApiResponse.ok(teachingService.enrollments(teachingClassId));
    }

    @PostMapping("/api/enrollments")
    @PreAuthorize("hasAuthority('enrollment:manage')")
    public ApiResponse<TeachingClassStudent> enroll(@Valid @RequestBody EnrollmentRequest request) {
        return ApiResponse.ok(teachingService.enroll(request));
    }

    @DeleteMapping("/api/enrollments/{id}")
    @PreAuthorize("hasAuthority('enrollment:manage')")
    public ApiResponse<Void> deleteEnrollment(@PathVariable Long id) {
        teachingService.deleteEnrollment(id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/api/grades")
    @PreAuthorize("hasAuthority('grade:manage') or hasAuthority('student:grade:view')")
    public ApiResponse<List<GradeRecord>> grades(@RequestParam(required = false) Long teachingClassId,
                                                 @RequestParam(required = false) Long studentId) {
        return ApiResponse.ok(teachingService.grades(teachingClassId, studentId));
    }

    @PostMapping("/api/grades")
    @PreAuthorize("hasAuthority('grade:manage')")
    public ApiResponse<GradeRecord> createGrade(@Valid @RequestBody GradeRequest request) {
        return ApiResponse.ok(teachingService.saveGrade(null, request));
    }

    @PutMapping("/api/grades/{id}")
    @PreAuthorize("hasAuthority('grade:manage')")
    public ApiResponse<GradeRecord> updateGrade(@PathVariable Long id, @Valid @RequestBody GradeRequest request) {
        return ApiResponse.ok(teachingService.saveGrade(id, request));
    }

    @GetMapping("/api/attendance")
    @PreAuthorize("hasAuthority('attendance:manage') or hasAuthority('student:attendance:view')")
    public ApiResponse<List<AttendanceRecord>> attendance(@RequestParam(required = false) Long teachingClassId,
                                                          @RequestParam(required = false) Long studentId) {
        return ApiResponse.ok(teachingService.attendance(teachingClassId, studentId));
    }

    @PostMapping("/api/attendance")
    @PreAuthorize("hasAuthority('attendance:manage')")
    public ApiResponse<AttendanceRecord> createAttendance(@Valid @RequestBody AttendanceRequest request) {
        return ApiResponse.ok(teachingService.saveAttendance(null, request));
    }

    @PutMapping("/api/attendance/{id}")
    @PreAuthorize("hasAuthority('attendance:manage')")
    public ApiResponse<AttendanceRecord> updateAttendance(@PathVariable Long id, @Valid @RequestBody AttendanceRequest request) {
        return ApiResponse.ok(teachingService.saveAttendance(id, request));
    }

    @PostMapping("/api/warnings/recalculate")
    @PreAuthorize("hasAuthority('warning:view')")
    public ApiResponse<Integer> recalculateWarnings() {
        return ApiResponse.ok(teachingService.recalculateWarnings());
    }

    @GetMapping("/api/warnings")
    @PreAuthorize("hasAuthority('warning:view') or hasAuthority('student:warning:view')")
    public ApiResponse<List<AcademicWarning>> warnings(@RequestParam(required = false) Long studentId) {
        return ApiResponse.ok(teachingService.warnings(studentId));
    }

    @GetMapping("/api/my/courses")
    @PreAuthorize("hasAuthority('student:course:view')")
    public ApiResponse<PageResult<TeachingClass>> myCourses(@Valid PageRequest request) {
        return ApiResponse.ok(teachingService.teachingClasses(request));
    }

    @GetMapping("/api/my/grades")
    @PreAuthorize("hasAuthority('student:grade:view')")
    public ApiResponse<List<GradeRecord>> myGrades() {
        return ApiResponse.ok(teachingService.grades(null, null));
    }

    @GetMapping("/api/my/attendance")
    @PreAuthorize("hasAuthority('student:attendance:view')")
    public ApiResponse<List<AttendanceRecord>> myAttendance() {
        return ApiResponse.ok(teachingService.attendance(null, null));
    }

    @GetMapping("/api/my/warnings")
    @PreAuthorize("hasAuthority('student:warning:view')")
    public ApiResponse<List<AcademicWarning>> myWarnings() {
        SecurityUtils.currentUser();
        return ApiResponse.ok(teachingService.warnings(null));
    }
}
