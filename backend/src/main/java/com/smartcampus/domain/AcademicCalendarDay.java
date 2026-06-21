package com.smartcampus.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@TableName("academic_calendar_day")
@EqualsAndHashCode(callSuper = true)
public class AcademicCalendarDay extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long calendarId;
    private LocalDate calendarDate;
    private Integer weekNo;
    private String monthLabel;
    private String dayText;
    private String eventName;
    private String dayType;
}
