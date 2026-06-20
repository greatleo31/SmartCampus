package com.smartcampus.service;

import com.smartcampus.domain.SysUser;
import com.smartcampus.dto.EmailBindRequest;
import com.smartcampus.dto.PasswordChangeRequest;
import com.smartcampus.dto.WechatBindRequest;
import com.smartcampus.exception.BizException;
import com.smartcampus.mapper.SysUserMapper;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.security.SecurityUtils;
import com.smartcampus.vo.ProfileSecurityVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final SysUserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public ProfileSecurityVO security() {
        SysUser user = requireCurrentUser();
        return new ProfileSecurityVO(
                user.getId(),
                user.getUsername(),
                user.getRealName(),
                user.getUserType(),
                user.getEmail(),
                user.getWechatBound() != null && user.getWechatBound() == 1,
                user.getCampusIdentity(),
                user.getLastLoginTime()
        );
    }

    public void changePassword(PasswordChangeRequest request) {
        SysUser user = requireCurrentUser();
        if (!passwordEncoder.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new BizException(400, "原密码不正确");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userMapper.updateById(user);
    }

    public ProfileSecurityVO bindEmail(EmailBindRequest request) {
        SysUser user = requireCurrentUser();
        user.setEmail(request.email());
        userMapper.updateById(user);
        return security();
    }

    public ProfileSecurityVO bindWechat(WechatBindRequest request) {
        SysUser user = requireCurrentUser();
        user.setWechatBound(Boolean.TRUE.equals(request.bound()) ? 1 : 0);
        user.setCampusIdentity(request.campusIdentity());
        userMapper.updateById(user);
        return security();
    }

    private SysUser requireCurrentUser() {
        CurrentUser currentUser = SecurityUtils.currentUser();
        SysUser user = userMapper.selectById(currentUser.id());
        if (user == null) {
            throw new BizException(404, "用户不存在");
        }
        return user;
    }
}
