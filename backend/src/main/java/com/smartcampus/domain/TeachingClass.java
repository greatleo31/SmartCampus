package com.smartcampus.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("teaching_class")
@EqualsAndHashCode(callSuper = true)
public class TeachingClass extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String classCode;
    private String className;
    private Long semesterId;
    private Long courseId;
    private Long teacherId;
    private Integer capacity;
}
