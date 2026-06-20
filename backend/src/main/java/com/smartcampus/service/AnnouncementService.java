package com.smartcampus.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.smartcampus.domain.Announcement;
import com.smartcampus.dto.AnnouncementRequest;
import com.smartcampus.exception.BizException;
import com.smartcampus.mapper.AnnouncementMapper;
import com.smartcampus.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {
    private final AnnouncementMapper announcementMapper;

    public List<Announcement> published(String category) {
        return announcementMapper.selectList(new LambdaQueryWrapper<Announcement>()
                .eq(Announcement::getStatus, "PUBLISHED")
                .eq(category != null && !category.isBlank(), Announcement::getCategory, category)
                .orderByDesc(Announcement::getPinned)
                .orderByDesc(Announcement::getPublishTime)
                .last("limit 20"));
    }

    public List<Announcement> all() {
        return announcementMapper.selectList(new LambdaQueryWrapper<Announcement>()
                .orderByDesc(Announcement::getPinned)
                .orderByDesc(Announcement::getPublishTime));
    }

    public Announcement save(Long id, AnnouncementRequest request) {
        if (!List.of("NOTICE", "MEETING", "PUBLICITY", "LECTURE").contains(request.category())) {
            throw new BizException(400, "公告分类不合法");
        }
        if (!List.of("DRAFT", "PUBLISHED").contains(request.status())) {
            throw new BizException(400, "公告状态不合法");
        }
        Announcement announcement = id == null ? new Announcement() : require(id);
        announcement.setTitle(request.title());
        announcement.setCategory(request.category());
        announcement.setSummary(request.summary());
        announcement.setContent(request.content());
        announcement.setStatus(request.status());
        announcement.setPinned(Boolean.TRUE.equals(request.pinned()) ? 1 : 0);
        announcement.setPublisherId(SecurityUtils.currentUser().id());
        if ("PUBLISHED".equals(request.status()) && announcement.getPublishTime() == null) {
            announcement.setPublishTime(LocalDateTime.now());
        }
        if (id == null) {
            announcementMapper.insert(announcement);
        } else {
            announcementMapper.updateById(announcement);
        }
        return announcement;
    }

    public void delete(Long id) {
        require(id);
        announcementMapper.deleteById(id);
    }

    private Announcement require(Long id) {
        Announcement announcement = announcementMapper.selectById(id);
        if (announcement == null) {
            throw new BizException(404, "公告不存在");
        }
        return announcement;
    }
}
