package com.smartcampus.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@TableName("academic_calendar")
@EqualsAndHashCode(callSuper = true)
public class AcademicCalendar extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String academicYear;
    private Integer term;
    private Integer yearLabel;
    private LocalDate startDate;
    private LocalDate endDate;
}
