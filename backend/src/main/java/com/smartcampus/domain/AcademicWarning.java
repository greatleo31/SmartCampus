package com.smartcampus.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@TableName("academic_warning")
@EqualsAndHashCode(callSuper = true)
public class AcademicWarning extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long teachingClassId;
    private Long studentId;
    private String warningLevel;
    private String reason;
    private String status;
    private LocalDateTime generatedTime;
}
