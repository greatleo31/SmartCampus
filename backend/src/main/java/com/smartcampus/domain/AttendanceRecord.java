package com.smartcampus.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@TableName("attendance_record")
@EqualsAndHashCode(callSuper = true)
public class AttendanceRecord extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long teachingClassId;
    private Long studentId;
    private LocalDate attendanceDate;
    private String status;
    private String remark;
}
