package com.smartcampus.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ClassScheduleRequest(
        @NotNull Long teachingClassId,
        @NotNull @Min(1) @Max(7) Integer dayOfWeek,
        @NotNull @Min(1) @Max(14) Integer startSection,
        @NotNull @Min(1) @Max(14) Integer endSection,
        @NotNull @Min(1) Integer startWeek,
        @NotNull @Min(1) Integer endWeek,
        @NotBlank String classroom,
        String location
) {
}
