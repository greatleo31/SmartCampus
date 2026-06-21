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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
        List<MenuVO> menus = permissionMapper.selectList(new LambdaQueryWrapper<SysPermission>()
                        .in(SysPermission::getRoleCode, currentUser.roles())
                        .isNotNull(SysPermission::getMenuPath))
                .stream()
                .map(p -> new MenuVO(p.getName(), p.getMenuPath(), p.getCode()))
                .distinct()
                .toList();
        if (currentUser.isStudent()) {
            return sortStudentMenus(menus);
        }
        return menus.stream().sorted(Comparator.comparingInt(menu -> menuOrder(menu.path()))).toList();
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

    private List<MenuVO> sortStudentMenus(List<MenuVO> menus) {
        List<String> order = List.of("/", "/calendar", "/class-schedule", "/schedule", "/my/courses", "/exams", "/my/grades", "/gpa-ranking", "/makeup-exams");
        Map<String, MenuVO> byPath = new LinkedHashMap<>();
        menus.forEach(menu -> byPath.putIfAbsent(menu.path(), menu));
        List<MenuVO> sorted = new ArrayList<>();
        for (String path : order) {
            MenuVO menu = byPath.remove(path);
            if (menu != null) {
                sorted.add(menu);
            }
        }
        sorted.addAll(byPath.values().stream()
                .sorted(Comparator.comparingInt(menu -> menuOrder(menu.path())))
                .toList());
        return sorted;
    }

    private int menuOrder(String path) {
        return switch (path) {
            case "/" -> 0;
            case "/calendar" -> 10;
            case "/class-schedule" -> 20;
            case "/schedule" -> 30;
            case "/my/courses" -> 40;
            case "/exams" -> 50;
            case "/my/grades", "/grades" -> 60;
            case "/gpa-ranking" -> 70;
            case "/makeup-exams" -> 80;
            case "/attendance" -> 90;
            case "/warnings" -> 100;
            case "/profile" -> 110;
            case "/semesters" -> 120;
            case "/courses" -> 130;
            case "/teaching-classes" -> 140;
            case "/enrollments" -> 150;
            default -> 999;
        };
    }
}
