package com.smartcampus.security;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.smartcampus.domain.SysPermission;
import com.smartcampus.domain.SysRole;
import com.smartcampus.domain.SysUser;
import com.smartcampus.domain.SysUserRole;
import com.smartcampus.mapper.SysPermissionMapper;
import com.smartcampus.mapper.SysRoleMapper;
import com.smartcampus.mapper.SysUserMapper;
import com.smartcampus.mapper.SysUserRoleMapper;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final SysUserMapper userMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final SysRoleMapper roleMapper;
    private final SysPermissionMapper permissionMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            Claims claims = jwtService.parse(header.substring(7));
            Long userId = ((Number) claims.get("uid")).longValue();
            SysUser user = userMapper.selectById(userId);
            if (user != null && user.getStatus() == 1) {
                List<Long> roleIds = userRoleMapper.selectList(new LambdaQueryWrapper<SysUserRole>()
                                .eq(SysUserRole::getUserId, userId))
                        .stream().map(SysUserRole::getRoleId).toList();
                List<String> roles = roleIds.isEmpty() ? List.of() : roleMapper.selectBatchIds(roleIds)
                        .stream().map(SysRole::getCode).toList();
                List<String> permissions = roles.isEmpty() ? List.of() : permissionMapper.selectList(
                                new LambdaQueryWrapper<SysPermission>().in(SysPermission::getRoleCode, roles))
                        .stream().map(SysPermission::getCode).distinct().toList();
                CurrentUser currentUser = new CurrentUser(user.getId(), user.getUsername(), user.getRealName(),
                        user.getUserType(), roles, permissions);
                List<SimpleGrantedAuthority> authorities = permissions.stream()
                        .map(SimpleGrantedAuthority::new)
                        .toList();
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(currentUser, null, authorities));
            }
        } catch (Exception ignored) {
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request, response);
    }
}
