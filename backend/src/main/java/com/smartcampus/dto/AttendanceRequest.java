package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AttendanceRequest(
        @NotNull Long teachingClassId,
        @NotNull Long studentId,
        @NotNull LocalDate attendanceDate,
        @NotBlank String status,
        String remark
) {
}
