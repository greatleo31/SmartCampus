package com.smartcampus.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record GradeRequest(
        @NotNull Long teachingClassId,
        @NotNull Long studentId,
        @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal regularScore,
        @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal finalScore
) {
}
