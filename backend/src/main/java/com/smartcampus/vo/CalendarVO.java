package com.smartcampus.vo;

import java.util.List;

public record CalendarVO(
        String academicYear,
        Integer term,
        Integer yearLabel,
        List<CalendarDayVO> days
) {
}
