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
import com.smartcampus.service.ExcelService;
import com.smartcampus.service.TeachingService;
import com.smartcampus.vo.DashboardVO;
import com.smartcampus.vo.ImportResultVO;
import com.smartcampus.vo.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class TeachingController {
    private final TeachingService teachingService;
    private final ExcelService excelService;

    @GetMapping("/api/dashboard/overview")
    @PreAuthorize("hasAuthority('dashboard:view')")
    public ApiResponse<DashboardVO> dashboard() {
        return ApiResponse.ok(teachingService.dashboard());
    }

    @GetMapping("/api/teaching-classes")
    @PreAuthorize("hasAuthority('class:manage') or hasAuthority('grade:manage') or hasAuthority('attendance:manage') or hasAuthority('student:course:view')")
    public ApiResponse<PageResult<TeachingClassVO>> teachingClasses(@Valid PageRequest request) {
        return ApiResponse.ok(teachingService.teachingClasses(request));
    }

    @GetMapping("/api/teachers")
    @PreAuthorize("hasAuthority('admin:access') or hasAuthority('class:manage')")
    public ApiResponse<List<TeacherProfileVO>> teachers() {
        return ApiResponse.ok(teachingService.teachers());
    }

    @GetMapping("/api/students")
    @PreAuthorize("hasAuthority('admin:access') or hasAuthority('enrollment:manage')")
    public ApiResponse<List<StudentProfileVO>> students() {
        return ApiResponse.ok(teachingService.students());
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
    public ApiResponse<List<EnrollmentVO>> enrollments(@RequestParam Long teachingClassId) {
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
    public ApiResponse<List<GradeRecordVO>> grades(@RequestParam(required = false) Long teachingClassId,
                                                   @RequestParam(required = false) Long studentId) {
        return ApiResponse.ok(teachingService.gradeViews(teachingClassId, studentId));
    }

    @PostMapping("/api/grades")
    @PreAuthorize("hasAuthority('admin:access')")
    public ApiResponse<GradeRecord> createGrade(@Valid @RequestBody GradeRequest request) {
        return ApiResponse.ok(teachingService.saveGrade(null, request));
    }

    @PutMapping("/api/grades/{id}")
    @PreAuthorize("hasAuthority('admin:access')")
    public ApiResponse<GradeRecord> updateGrade(@PathVariable Long id, @Valid @RequestBody GradeRequest request) {
        return ApiResponse.ok(teachingService.saveGrade(id, request));
    }

    @DeleteMapping("/api/grades/{id}")
    @PreAuthorize("hasAuthority('admin:access')")
    public ApiResponse<Void> deleteGrade(@PathVariable Long id) {
        teachingService.deleteGrade(id);
        return ApiResponse.ok(null);
    }

    @PostMapping("/api/grades/batch-delete")
    @PreAuthorize("hasAuthority('admin:access')")
    public ApiResponse<Void> deleteGrades(@RequestBody List<Long> ids) {
        teachingService.deleteGrades(ids);
        return ApiResponse.ok(null);
    }

    @GetMapping("/api/grades/template-xlsx")
    @PreAuthorize("hasAuthority('grade:manage')")
    public ResponseEntity<byte[]> gradeTemplate() {
        return xlsx("成绩导入模板.xlsx", excelService.gradeTemplate());
    }

    @GetMapping("/api/grades/export-xlsx")
    @PreAuthorize("hasAuthority('grade:manage')")
    public ResponseEntity<byte[]> exportGrades() {
        return xlsx("成绩数据.xlsx", excelService.exportGrades());
    }

    @PostMapping("/api/grades/import-xlsx")
    @PreAuthorize("hasAuthority('grade:manage')")
    public ApiResponse<ImportResultVO> importGrades(@RequestParam("file") MultipartFile file) {
        return ApiResponse.ok(excelService.importGrades(file));
    }

    @GetMapping("/api/attendance")
    @PreAuthorize("hasAuthority('attendance:manage') or hasAuthority('student:attendance:view')")
    public ApiResponse<List<AttendanceRecordVO>> attendance(@RequestParam(required = false) Long teachingClassId,
                                                            @RequestParam(required = false) Long studentId) {
        return ApiResponse.ok(teachingService.attendanceViews(teachingClassId, studentId));
    }

    @PostMapping("/api/attendance")
    @PreAuthorize("hasAuthority('admin:access')")
    public ApiResponse<AttendanceRecord> createAttendance(@Valid @RequestBody AttendanceRequest request) {
        return ApiResponse.ok(teachingService.saveAttendance(null, request));
    }

    @PutMapping("/api/attendance/{id}")
    @PreAuthorize("hasAuthority('admin:access')")
    public ApiResponse<AttendanceRecord> updateAttendance(@PathVariable Long id, @Valid @RequestBody AttendanceRequest request) {
        return ApiResponse.ok(teachingService.saveAttendance(id, request));
    }

    @DeleteMapping("/api/attendance/{id}")
    @PreAuthorize("hasAuthority('admin:access')")
    public ApiResponse<Void> deleteAttendance(@PathVariable Long id) {
        teachingService.deleteAttendance(id);
        return ApiResponse.ok(null);
    }

    @PostMapping("/api/attendance/batch-delete")
    @PreAuthorize("hasAuthority('admin:access')")
    public ApiResponse<Void> deleteAttendanceBatch(@RequestBody List<Long> ids) {
        teachingService.deleteAttendanceBatch(ids);
        return ApiResponse.ok(null);
    }

    @GetMapping("/api/attendance/template-xlsx")
    @PreAuthorize("hasAuthority('admin:access')")
    public ResponseEntity<byte[]> attendanceTemplate() {
        return xlsx("考勤导入模板.xlsx", excelService.attendanceTemplate());
    }

    @GetMapping("/api/attendance/export-xlsx")
    @PreAuthorize("hasAuthority('admin:access')")
    public ResponseEntity<byte[]> exportAttendance() {
        return xlsx("考勤数据.xlsx", excelService.exportAttendance());
    }

    @PostMapping("/api/attendance/import-xlsx")
    @PreAuthorize("hasAuthority('admin:access')")
    public ApiResponse<ImportResultVO> importAttendance(@RequestParam("file") MultipartFile file) {
        return ApiResponse.ok(excelService.importAttendance(file));
    }

    @PostMapping("/api/warnings/recalculate")
    @PreAuthorize("hasAuthority('warning:view')")
    public ApiResponse<Integer> recalculateWarnings() {
        return ApiResponse.ok(teachingService.recalculateWarnings());
    }

    @GetMapping("/api/warnings")
    @PreAuthorize("hasAuthority('warning:view') or hasAuthority('student:warning:view')")
    public ApiResponse<List<AcademicWarningVO>> warnings(@RequestParam(required = false) Long studentId) {
        return ApiResponse.ok(teachingService.warningViews(studentId));
    }

    @GetMapping("/api/my/courses")
    @PreAuthorize("hasAuthority('student:course:view')")
    public ApiResponse<PageResult<TeachingClassVO>> myCourses(@Valid PageRequest request) {
        return ApiResponse.ok(teachingService.teachingClasses(request));
    }

    @GetMapping("/api/my/grades")
    @PreAuthorize("hasAuthority('student:grade:view')")
    public ApiResponse<List<GradeRecordVO>> myGrades() {
        return ApiResponse.ok(teachingService.gradeViews(null, null));
    }

    @GetMapping("/api/my/attendance")
    @PreAuthorize("hasAuthority('student:attendance:view')")
    public ApiResponse<List<AttendanceRecordVO>> myAttendance() {
        return ApiResponse.ok(teachingService.attendanceViews(null, null));
    }

    @GetMapping("/api/my/warnings")
    @PreAuthorize("hasAuthority('student:warning:view')")
    public ApiResponse<List<AcademicWarningVO>> myWarnings() {
        SecurityUtils.currentUser();
        return ApiResponse.ok(teachingService.warningViews(null));
    }

    private ResponseEntity<byte[]> xlsx(String filename, byte[] bytes) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(filename, StandardCharsets.UTF_8)
                        .build()
                        .toString())
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }
}
