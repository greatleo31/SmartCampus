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
    private final LocalCacheService localCacheService;

    public List<Announcement> published(String category) {
        return localCacheService.normalTtl(localCacheService.key("announcements:published", category), () ->
                announcementMapper.selectList(new LambdaQueryWrapper<Announcement>()
                        .eq(Announcement::getStatus, "PUBLISHED")
                        .eq(category != null && !category.isBlank(), Announcement::getCategory, category)
                        .orderByDesc(Announcement::getPinned)
                        .orderByDesc(Announcement::getPublishTime)
                        .last("limit 20")));
    }

    public List<Announcement> all() {
        return localCacheService.normalTtl(localCacheService.key("announcements:all"), () ->
                announcementMapper.selectList(new LambdaQueryWrapper<Announcement>()
                        .orderByDesc(Announcement::getPinned)
                        .orderByDesc(Announcement::getPublishTime)));
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
        announcement.setSummary(request.summary() == null ? "" : request.summary());
        announcement.setContent(request.content() == null ? "" : request.content());
        announcement.setStatus(request.status());
        announcement.setPinned(Boolean.TRUE.equals(request.pinned()) ? 1 : 0);
        announcement.setPublisherId(SecurityUtils.currentUser().id());
        announcement.setSourceUrl(request.sourceUrl());
        if (request.publishTime() != null) {
            announcement.setPublishTime(request.publishTime());
        } else if ("PUBLISHED".equals(request.status()) && announcement.getPublishTime() == null) {
            announcement.setPublishTime(LocalDateTime.now());
        }
        if (id == null) {
            announcementMapper.insert(announcement);
        } else {
            announcementMapper.updateById(announcement);
        }
        localCacheService.invalidatePrefix("announcements");
        return announcement;
    }

    public void delete(Long id) {
        require(id);
        announcementMapper.deleteById(id);
        localCacheService.invalidatePrefix("announcements");
    }

    private Announcement require(Long id) {
        Announcement announcement = announcementMapper.selectById(id);
        if (announcement == null) {
            throw new BizException(404, "公告不存在");
        }
        return announcement;
    }
}
