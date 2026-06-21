package com.smartcampus.service;

import com.smartcampus.domain.*;
import com.smartcampus.dto.EmailBindRequest;
import com.smartcampus.dto.PasswordChangeRequest;
import com.smartcampus.dto.WechatBindRequest;
import com.smartcampus.exception.BizException;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.smartcampus.mapper.*;
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
    private final StudentProfileMapper studentProfileMapper;
    private final TeacherProfileMapper teacherProfileMapper;
    private final MajorMapper majorMapper;
    private final AdminClassMapper adminClassMapper;
    private final CollegeMapper collegeMapper;
    private final PasswordEncoder passwordEncoder;

    public ProfileSecurityVO security() {
        SysUser user = requireCurrentUser();
        StudentProfile student = studentProfileMapper.selectOne(new LambdaQueryWrapper<StudentProfile>()
                .eq(StudentProfile::getUserId, user.getId())
                .last("limit 1"));
        TeacherProfile teacher = teacherProfileMapper.selectOne(new LambdaQueryWrapper<TeacherProfile>()
                .eq(TeacherProfile::getUserId, user.getId())
                .last("limit 1"));
        Major major = student == null || student.getMajorId() == null ? null : majorMapper.selectById(student.getMajorId());
        AdminClass adminClass = student == null || student.getAdminClassId() == null ? null : adminClassMapper.selectById(student.getAdminClassId());
        College studentCollege = major == null ? null : collegeMapper.selectById(major.getCollegeId());
        College teacherCollege = teacher == null || teacher.getCollegeId() == null ? null : collegeMapper.selectById(teacher.getCollegeId());
        return new ProfileSecurityVO(
                user.getId(),
                user.getUsername(),
                user.getRealName(),
                user.getUserType(),
                user.getEmail(),
                user.getWechatBound() != null && user.getWechatBound() == 1,
                studentCollege != null ? studentCollege.getName() : teacherCollege != null ? teacherCollege.getName() : null,
                major != null ? major.getName() : student == null ? null : student.getMajor(),
                adminClass != null ? adminClass.getClassName() : student == null ? null : student.getClassName(),
                student == null ? null : student.getStudentNo(),
                teacher == null ? null : teacher.getTeacherNo(),
                teacher == null ? null : teacher.getTitle(),
                teacher == null ? null : teacher.getDepartment(),
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
