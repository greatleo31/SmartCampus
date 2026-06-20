package com.smartcampus.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("class_schedule")
@EqualsAndHashCode(callSuper = true)
public class ClassSchedule extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long teachingClassId;
    private Integer dayOfWeek;
    private Integer startSection;
    private Integer endSection;
    private Integer startWeek;
    private Integer endWeek;
    private String classroom;
    private String location;
}
