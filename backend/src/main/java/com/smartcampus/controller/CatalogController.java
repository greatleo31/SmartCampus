package com.smartcampus.controller;

import com.smartcampus.common.ApiResponse;
import com.smartcampus.common.PageRequest;
import com.smartcampus.common.PageResult;
import com.smartcampus.domain.Course;
import com.smartcampus.domain.Semester;
import com.smartcampus.dto.CourseRequest;
import com.smartcampus.dto.SemesterRequest;
import com.smartcampus.service.CalendarService;
import com.smartcampus.service.CatalogService;
import com.smartcampus.vo.AdminClassVO;
import com.smartcampus.vo.CalendarVO;
import com.smartcampus.vo.CollegeVO;
import com.smartcampus.vo.CourseVO;
import com.smartcampus.vo.MajorVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CatalogController {
    private final CatalogService catalogService;
    private final CalendarService calendarService;

    @GetMapping("/api/semesters")
    @PreAuthorize("hasAuthority('semester:manage')")
    public ApiResponse<PageResult<Semester>> semesters(@Valid PageRequest request) {
        return ApiResponse.ok(catalogService.semesters(request));
    }

    @PostMapping("/api/semesters")
    @PreAuthorize("hasAuthority('semester:manage')")
    public ApiResponse<Semester> createSemester(@Valid @RequestBody SemesterRequest request) {
        return ApiResponse.ok(catalogService.saveSemester(null, request));
    }

    @PutMapping("/api/semesters/{id}")
    @PreAuthorize("hasAuthority('semester:manage')")
    public ApiResponse<Semester> updateSemester(@PathVariable Long id, @Valid @RequestBody SemesterRequest request) {
        return ApiResponse.ok(catalogService.saveSemester(id, request));
    }

    @DeleteMapping("/api/semesters/{id}")
    @PreAuthorize("hasAuthority('semester:manage')")
    public ApiResponse<Void> deleteSemester(@PathVariable Long id) {
        catalogService.deleteSemester(id);
        return ApiResponse.ok(null);
    }

    @GetMapping("/api/courses")
    @PreAuthorize("hasAuthority('course:manage')")
    public ApiResponse<PageResult<CourseVO>> courses(@Valid PageRequest request) {
        return ApiResponse.ok(catalogService.courses(request));
    }

    @GetMapping("/api/colleges")
    @PreAuthorize("hasAuthority('dashboard:view')")
    public ApiResponse<List<CollegeVO>> colleges() {
        return ApiResponse.ok(catalogService.colleges());
    }

    @GetMapping("/api/calendar-options")
    @PreAuthorize("hasAuthority('dashboard:view')")
    public ApiResponse<List<CalendarVO>> calendarOptions() {
        return ApiResponse.ok(calendarService.options());
    }

    @GetMapping("/api/majors")
    @PreAuthorize("hasAuthority('dashboard:view')")
    public ApiResponse<List<MajorVO>> majors(@RequestParam(required = false) Long collegeId) {
        return ApiResponse.ok(catalogService.majors(collegeId));
    }

    @GetMapping("/api/admin-classes")
    @PreAuthorize("hasAuthority('dashboard:view')")
    public ApiResponse<List<AdminClassVO>> adminClasses(@RequestParam(required = false) Long majorId) {
        return ApiResponse.ok(catalogService.adminClasses(majorId));
    }

    @PostMapping("/api/courses")
    @PreAuthorize("hasAuthority('course:manage')")
    public ApiResponse<Course> createCourse(@Valid @RequestBody CourseRequest request) {
        return ApiResponse.ok(catalogService.saveCourse(null, request));
    }

    @PutMapping("/api/courses/{id}")
    @PreAuthorize("hasAuthority('course:manage')")
    public ApiResponse<Course> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        return ApiResponse.ok(catalogService.saveCourse(id, request));
    }

    @DeleteMapping("/api/courses/{id}")
    @PreAuthorize("hasAuthority('course:manage')")
    public ApiResponse<Void> deleteCourse(@PathVariable Long id) {
        catalogService.deleteCourse(id);
        return ApiResponse.ok(null);
    }
}
