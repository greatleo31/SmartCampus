package com.smartcampus.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@TableName("grade_record")
@EqualsAndHashCode(callSuper = true)
public class GradeRecord extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long teachingClassId;
    private Long studentId;
    private BigDecimal regularScore;
    private BigDecimal finalScore;
    private BigDecimal totalScore;
}
