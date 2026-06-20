package com.smartcampus.vo;

public record AdminStatsVO(
        long userCount,
        long activeUserCount,
        long announcementCount,
        long scheduleCount,
        long importTaskCount,
        long exceptionTaskCount
) {
}
