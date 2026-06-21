package com.smartcampus.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("admin_class")
@EqualsAndHashCode(callSuper = true)
public class AdminClass extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long majorId;
    private String className;
    private Integer gradeYear;
    private Integer classNo;
}
