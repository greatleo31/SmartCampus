package com.smartcampus.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.smartcampus.domain.AcademicCalendar;
import com.smartcampus.domain.AcademicCalendarDay;
import com.smartcampus.domain.Semester;
import com.smartcampus.mapper.AcademicCalendarDayMapper;
import com.smartcampus.mapper.AcademicCalendarMapper;
import com.smartcampus.mapper.SemesterMapper;
import com.smartcampus.vo.CalendarDayVO;
import com.smartcampus.vo.CalendarVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CalendarService {
    private final AcademicCalendarMapper calendarMapper;
    private final AcademicCalendarDayMapper calendarDayMapper;
    private final SemesterMapper semesterMapper;

    public CalendarVO calendar(String academicYear, Integer term) {
        String year = academicYear == null || academicYear.isBlank() ? "2025-2026" : academicYear;
        Integer termNo = term == null ? 2 : term;
        AcademicCalendar calendar = calendarMapper.selectOne(new LambdaQueryWrapper<AcademicCalendar>()
                .eq(AcademicCalendar::getAcademicYear, year)
                .eq(AcademicCalendar::getTerm, termNo)
                .last("limit 1"));
        if (calendar == null) {
            return new CalendarVO(year, termNo, Integer.parseInt(year.substring(0, 4)), List.of());
        }
        List<CalendarDayVO> days = calendarDayMapper.selectList(new LambdaQueryWrapper<AcademicCalendarDay>()
                        .eq(AcademicCalendarDay::getCalendarId, calendar.getId())
                        .orderByAsc(AcademicCalendarDay::getCalendarDate))
                .stream()
                .map(day -> new CalendarDayVO(
                        day.getCalendarDate(),
                        day.getWeekNo(),
                        day.getMonthLabel(),
                        day.getDayText(),
                        day.getEventName(),
                        day.getDayType()))
                .toList();
        return new CalendarVO(calendar.getAcademicYear(), calendar.getTerm(), calendar.getYearLabel(), days);
    }

    public List<CalendarVO> options() {
        List<AcademicCalendar> calendars = calendarMapper.selectList(new LambdaQueryWrapper<AcademicCalendar>()
                .orderByDesc(AcademicCalendar::getAcademicYear)
                .orderByDesc(AcademicCalendar::getTerm));
        if (!calendars.isEmpty()) {
            return calendars.stream()
                    .map(calendar -> new CalendarVO(calendar.getAcademicYear(), calendar.getTerm(), calendar.getYearLabel(), List.of()))
                    .toList();
        }
        return semesterMapper.selectList(new LambdaQueryWrapper<Semester>()
                        .orderByDesc(Semester::getStartDate))
                .stream()
                .map(this::fromSemester)
                .toList();
    }

    private CalendarVO fromSemester(Semester semester) {
        LocalDate startDate = semester.getStartDate() == null ? LocalDate.now() : semester.getStartDate();
        int startYear = startDate.getMonthValue() >= 8 ? startDate.getYear() : startDate.getYear() - 1;
        int term = startDate.getMonthValue() >= 8 ? 1 : 2;
        return new CalendarVO(String.format(Locale.ROOT, "%d-%d", startYear, startYear + 1), term, startYear, List.of());
    }
}
