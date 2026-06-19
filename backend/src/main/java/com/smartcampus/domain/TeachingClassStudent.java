package com.smartcampus.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("teaching_class_student")
@EqualsAndHashCode(callSuper = true)
public class TeachingClassStudent extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long teachingClassId;
    private Long studentId;
}
