package com.smartcampus.vo;

import java.time.LocalDate;

public record CalendarDayVO(
        LocalDate date,
        Integer weekNo,
        String monthLabel,
        String dayText,
        String eventName,
        String dayType
) {
}
