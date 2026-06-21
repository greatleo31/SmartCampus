package com.smartcampus.vo;

import java.math.BigDecimal;

public record CourseVO(
        Long id,
        String code,
        String name,
        String aliasName,
        Long collegeId,
        String collegeName,
        BigDecimal credit,
        Integer hours
) {
}
