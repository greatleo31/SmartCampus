package com.smartcampus.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

class LocalCacheServiceTest {
    @Test
    void shouldReuseCachedValueUntilPrefixInvalidated() {
        LocalCacheService cacheService = new LocalCacheService(new ObjectMapper());
        AtomicInteger loads = new AtomicInteger();
        String key = cacheService.key("dashboard:overview", 1L, "ADMIN");

        Integer first = cacheService.shortTtl(key, loads::incrementAndGet);
        Integer second = cacheService.shortTtl(key, loads::incrementAndGet);
        cacheService.invalidatePrefix("dashboard:overview");
        Integer third = cacheService.shortTtl(key, loads::incrementAndGet);

        assertThat(first).isEqualTo(1);
        assertThat(second).isEqualTo(1);
        assertThat(third).isEqualTo(2);
    }
}
