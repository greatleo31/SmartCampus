package com.smartcampus.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.smartcampus.domain.*;
import com.smartcampus.dto.*;
import com.smartcampus.exception.BizException;
import com.smartcampus.mapper.*;
import com.smartcampus.vo.AdminUserVO;
import com.smartcampus.vo.AdminStatsVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysPermissionMapper permissionMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final SystemConfigMapper configMapper;
    private final AnnouncementMapper announcementMapper;
    private final ClassScheduleMapper scheduleMapper;
    private final AcademicWarningMapper warningMapper;
    private final PasswordEncoder passwordEncoder;

    public AdminStatsVO stats() {
        long userCount = userMapper.selectCount(new LambdaQueryWrapper<>());
        long activeUserCount = userMapper.selectCount(new LambdaQueryWrapper<SysUser>().eq(SysUser::getStatus, 1));
        long announcementCount = announcementMapper.selectCount(new LambdaQueryWrapper<>());
        long scheduleCount = scheduleMapper.selectCount(new LambdaQueryWrapper<>());
        long exceptionTaskCount = warningMapper.selectCount(new LambdaQueryWrapper<AcademicWarning>().eq(AcademicWarning::getStatus, "OPEN"));
        return new AdminStatsVO(userCount, activeUserCount, announcementCount, scheduleCount, 0, exceptionTaskCount);
    }

    public List<AdminUserVO> users() {
        return userMapper.selectList(new LambdaQueryWrapper<SysUser>().orderByDesc(SysUser::getId))
                .stream().map(this::toAdminUser).toList();
    }

    @Transactional
    public SysUser saveUser(Long id, UserAdminRequest request) {
        if (!List.of("ADMIN", "TEACHER", "STUDENT").contains(request.userType())) {
            throw new BizException(400, "用户类型不合法");
        }
        SysUser user = id == null ? new SysUser() : requireUser(id);
        if (id == null && (request.password() == null || request.password().isBlank())) {
            throw new BizException(400, "新用户必须设置初始密码");
        }
        user.setUsername(request.username());
        user.setRealName(request.realName());
        user.setUserType(request.userType());
        user.setStatus(request.status());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        if (id == null) {
            userMapper.insert(user);
        } else {
            userMapper.updateById(user);
        }
        assignRoles(user.getId(), request.roleIds());
        return user;
    }

    public void setUserStatus(Long id, Integer status) {
        SysUser user = requireUser(id);
        user.setStatus(status);
        userMapper.updateById(user);
    }

    public void resetPassword(Long id, PasswordResetRequest request) {
        SysUser user = requireUser(id);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userMapper.updateById(user);
    }

    public List<SysRole> roles() {
        return roleMapper.selectList(new LambdaQueryWrapper<SysRole>().orderByAsc(SysRole::getId));
    }

    public SysRole saveRole(Long id, RoleRequest request) {
        SysRole role = id == null ? new SysRole() : requireRole(id);
        role.setCode(request.code());
        role.setName(request.name());
        role.setDataScope(request.dataScope());
        if (id == null) {
            roleMapper.insert(role);
        } else {
            roleMapper.updateById(role);
        }
        return role;
    }

    public List<SysPermission> permissions() {
        return permissionMapper.selectList(new LambdaQueryWrapper<SysPermission>()
                .orderByAsc(SysPermission::getRoleCode)
                .orderByAsc(SysPermission::getMenuPath)
                .orderByAsc(SysPermission::getCode));
    }

    public SysPermission savePermission(Long id, PermissionRequest request) {
        SysPermission permission = id == null ? new SysPermission() : requirePermission(id);
        permission.setCode(request.code());
        permission.setName(request.name());
        permission.setMenuPath(request.menuPath());
        permission.setRoleCode(request.roleCode());
        if (id == null) {
            permissionMapper.insert(permission);
        } else {
            permissionMapper.updateById(permission);
        }
        return permission;
    }

    public List<SystemConfig> configs() {
        return configMapper.selectList(new LambdaQueryWrapper<SystemConfig>().orderByAsc(SystemConfig::getConfigKey));
    }

    public SystemConfig updateConfig(Long id, SystemConfigRequest request) {
        SystemConfig config = configMapper.selectById(id);
        if (config == null) {
            throw new BizException(404, "系统配置不存在");
        }
        config.setConfigName(request.configName());
        config.setConfigValue(request.configValue());
        config.setDescription(request.description());
        configMapper.updateById(config);
        return config;
    }

    private void assignRoles(Long userId, List<Long> roleIds) {
        userRoleMapper.deleteByUserIdPhysically(userId);
        for (Long roleId : roleIds) {
            if (roleMapper.selectById(roleId) == null) {
                throw new BizException(404, "角色不存在");
            }
            SysUserRole relation = new SysUserRole();
            relation.setUserId(userId);
            relation.setRoleId(roleId);
            userRoleMapper.insert(relation);
        }
    }

    private SysUser requireUser(Long id) {
        SysUser user = userMapper.selectById(id);
        if (user == null) {
            throw new BizException(404, "用户不存在");
        }
        return user;
    }

    private SysRole requireRole(Long id) {
        SysRole role = roleMapper.selectById(id);
        if (role == null) {
            throw new BizException(404, "角色不存在");
        }
        return role;
    }

    private SysPermission requirePermission(Long id) {
        SysPermission permission = permissionMapper.selectById(id);
        if (permission == null) {
            throw new BizException(404, "权限不存在");
        }
        return permission;
    }

    private AdminUserVO toAdminUser(SysUser user) {
        List<Long> roleIds = userRoleMapper.selectList(new LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getUserId, user.getId()))
                .stream().map(SysUserRole::getRoleId).toList();
        List<String> roles = roleIds.isEmpty() ? List.of() : roleMapper.selectBatchIds(roleIds)
                .stream().map(SysRole::getCode).toList();
        return new AdminUserVO(user.getId(), user.getUsername(), user.getRealName(), user.getUserType(), user.getStatus(), roles);
    }
}
