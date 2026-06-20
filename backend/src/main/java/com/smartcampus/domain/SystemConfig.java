package com.smartcampus.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("system_config")
@EqualsAndHashCode(callSuper = true)
public class SystemConfig extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String configKey;
    private String configName;
    private String configValue;
    private String description;
}
