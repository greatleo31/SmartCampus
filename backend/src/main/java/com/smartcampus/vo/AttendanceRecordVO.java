package com.smartcampus.vo;

import java.time.LocalDate;

public record AttendanceRecordVO(
        Long id,
        Long teachingClassId,
        Long studentId,
        String adminClassName,
        String studentNo,
        String studentName,
        String courseName,
        String semesterName,
        String teachingClassName,
        LocalDate attendanceDate,
        String weekLabel,
        String teacherName,
        String sectionLabel,
        String classroom,
        String status,
        String statusText,
        String remark
) {
}
