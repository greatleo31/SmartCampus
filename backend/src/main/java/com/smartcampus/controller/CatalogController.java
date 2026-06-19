package com.smartcampus.controller;

import com.smartcampus.common.ApiResponse;
import com.smartcampus.common.PageRequest;
import com.smartcampus.common.PageResult;
import com.smartcampus.domain.Course;
import com.smartcampus.domain.Semester;
import com.smartcampus.dto.CourseRequest;
import com.smartcampus.dto.SemesterRequest;
import com.smartcampus.service.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CatalogController {
    private final CatalogService catalogService;

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
    public ApiResponse<PageResult<Course>> courses(@Valid PageRequest request) {
        return ApiResponse.ok(catalogService.courses(request));
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
