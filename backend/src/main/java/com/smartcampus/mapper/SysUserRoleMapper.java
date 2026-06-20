package com.smartcampus.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.smartcampus.domain.SysUserRole;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;

public interface SysUserRoleMapper extends BaseMapper<SysUserRole> {
    @Delete("delete from sys_user_role where user_id = #{userId}")
    int deleteByUserIdPhysically(@Param("userId") Long userId);
}
