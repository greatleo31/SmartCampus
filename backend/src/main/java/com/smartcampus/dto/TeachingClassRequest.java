package com.smartcampus.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TeachingClassRequest(
        @NotBlank String classCode,
        @NotBlank String className,
        @NotNull Long semesterId,
        @NotNull Long courseId,
        @NotNull Long teacherId,
        @NotNull @Min(1) Integer capacity
) {
}
