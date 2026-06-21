package com.smartcampus.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("major")
@EqualsAndHashCode(callSuper = true)
public class Major extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long collegeId;
    private String code;
    private String name;
}
