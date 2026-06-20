package com.smartcampus.vo;

public record TrendPointVO(
        String label,
        long attendanceAbnormalCount,
        long warningCount,
        long absentCount
) {
}
