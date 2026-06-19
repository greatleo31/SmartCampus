package com.smartcampus.vo;

import com.smartcampus.domain.AcademicWarning;

import java.util.List;

public record DashboardVO(
        long teachingClassCount,
        long studentCount,
        long todayAttendanceAbnormalCount,
        long highRiskStudentCount,
        List<AcademicWarning> recentWarnings
) {
}
