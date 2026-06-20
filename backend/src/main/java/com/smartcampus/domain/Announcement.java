package com.smartcampus.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@TableName("announcement")
@EqualsAndHashCode(callSuper = true)
public class Announcement extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String category;
    private String summary;
    private String content;
    private String status;
    private Integer pinned;
    private Long publisherId;
    private LocalDateTime publishTime;
    private String sourceUrl;
}
