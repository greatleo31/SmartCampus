package com.smartcampus.vo;

import java.time.LocalDate;

public record AttendanceRecordVO(
        Long id,
        String teachingClassName,
        String courseName,
        String studentName,
        LocalDate attendanceDate,
        String status,
        String statusText,
        String remark
) {
}
