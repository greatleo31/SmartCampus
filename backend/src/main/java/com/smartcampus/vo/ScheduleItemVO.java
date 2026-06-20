package com.smartcampus.vo;

public record ScheduleItemVO(
        Long id,
        Long teachingClassId,
        String className,
        String courseName,
        String teacherName,
        Integer dayOfWeek,
        Integer startSection,
        Integer endSection,
        Integer startWeek,
        Integer endWeek,
        String classroom,
        String location
) {
}
