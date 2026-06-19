package com.smartcampus.dto;

import jakarta.validation.constraints.NotNull;

public record EnrollmentRequest(
        @NotNull Long teachingClassId,
        @NotNull Long studentId
) {
}
