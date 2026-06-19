package com.smartcampus.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.smartcampus.domain.SysPermission;
import com.smartcampus.domain.SysRole;
import com.smartcampus.domain.SysUser;
import com.smartcampus.domain.SysUserRole;
import com.smartcampus.dto.LoginRequest;
import com.smartcampus.exception.BizException;
import com.smartcampus.mapper.SysPermissionMapper;
import com.smartcampus.mapper.SysRoleMapper;
import com.smartcampus.mapper.SysUserMapper;
import com.smartcampus.mapper.SysUserRoleMapper;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.security.JwtService;
import com.smartcampus.security.SecurityUtils;
import com.smartcampus.vo.AuthTokenVO;
import com.smartcampus.vo.MenuVO;
import com.smartcampus.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final SysUserMapper userMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final SysRoleMapper roleMapper;
    private final SysPermissionMapper permissionMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthTokenVO login(LoginRequest request) {
        SysUser user = userMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, request.username()));
        if (user == null || user.getStatus() != 1 || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BizException(401, "用户名或密码错误");
        }
        user.setLastLoginTime(LocalDateTime.now());
        userMapper.updateById(user);
        CurrentUser currentUser = buildCurrentUser(user);
        return new AuthTokenVO(jwtService.generate(currentUser), toUserVO(currentUser));
    }

    public UserVO me() {
        return toUserVO(SecurityUtils.currentUser());
    }

    public List<MenuVO> menus() {
        CurrentUser currentUser = SecurityUtils.currentUser();
        return permissionMapper.selectList(new LambdaQueryWrapper<SysPermission>()
                        .in(SysPermission::getRoleCode, currentUser.roles())
                        .isNotNull(SysPermission::getMenuPath))
                .stream()
                .sorted(Comparator.comparing(SysPermission::getMenuPath))
                .map(p -> new MenuVO(p.getName(), p.getMenuPath(), p.getCode()))
                .distinct()
                .toList();
    }

    private CurrentUser buildCurrentUser(SysUser user) {
        List<Long> roleIds = userRoleMapper.selectList(new LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getUserId, user.getId()))
                .stream().map(SysUserRole::getRoleId).toList();
        List<String> roles = roleIds.isEmpty() ? List.of() : roleMapper.selectBatchIds(roleIds)
                .stream().map(SysRole::getCode).toList();
        List<String> permissions = roles.isEmpty() ? List.of() : permissionMapper.selectList(
                        new LambdaQueryWrapper<SysPermission>().in(SysPermission::getRoleCode, roles))
                .stream().map(SysPermission::getCode).distinct().toList();
        return new CurrentUser(user.getId(), user.getUsername(), user.getRealName(), user.getUserType(), roles, permissions);
    }

    private UserVO toUserVO(CurrentUser user) {
        return new UserVO(user.id(), user.username(), user.realName(), user.userType(), user.roles(), user.permissions());
    }
}
