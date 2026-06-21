package com.smartcampus.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CourseRequest(
        @NotBlank String code,
        @NotBlank String name,
        String aliasName,
        Long collegeId,
        @NotNull @DecimalMin("0.5") BigDecimal credit,
        @NotNull @Min(1) Integer hours
) {
}
