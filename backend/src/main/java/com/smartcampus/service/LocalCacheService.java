package com.smartcampus.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.function.Supplier;

@Service
@Slf4j
public class LocalCacheService {
    private static final String REDIS_KEY_PREFIX = "smartcampus:";
    private static final Duration REDIS_SHORT_TTL = Duration.ofMinutes(1);
    private static final Duration REDIS_NORMAL_TTL = Duration.ofMinutes(5);
    private static final Duration REDIS_LONG_TTL = Duration.ofMinutes(30);
    private static final Duration REDIS_BACKOFF = Duration.ofSeconds(30);

    private final ObjectMapper objectMapper;
    private final ObjectProvider<RedisTemplate<String, Object>> redisTemplateProvider;
    private volatile long redisDisabledUntilMillis = 0L;
    private final Cache<String, Object> shortCache = Caffeine.newBuilder()
            .initialCapacity(256)
            .maximumSize(5_000)
            .expireAfterWrite(Duration.ofMinutes(10))
            .build();
    private final Cache<String, Object> normalCache = Caffeine.newBuilder()
            .initialCapacity(512)
            .maximumSize(10_000)
            .expireAfterWrite(Duration.ofMinutes(30))
            .build();
    private final Cache<String, Object> longCache = Caffeine.newBuilder()
            .initialCapacity(256)
            .maximumSize(5_000)
            .expireAfterWrite(Duration.ofMinutes(59))
            .build();

    @Autowired
    public LocalCacheService(
            ObjectMapper objectMapper,
            ObjectProvider<RedisTemplate<String, Object>> redisTemplateProvider) {
        this.objectMapper = objectMapper;
        this.redisTemplateProvider = redisTemplateProvider;
    }

    public LocalCacheService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.redisTemplateProvider = null;
    }

    public String key(String namespace, Object... parts) {
        return namespace + ":" + digest(parts);
    }

    public <T> T shortTtl(String key, Supplier<T> loader) {
        return get(shortCache, key, REDIS_SHORT_TTL, loader);
    }

    public <T> T normalTtl(String key, Supplier<T> loader) {
        return get(normalCache, key, REDIS_NORMAL_TTL, loader);
    }

    public <T> T longTtl(String key, Supplier<T> loader) {
        return get(longCache, key, REDIS_LONG_TTL, loader);
    }

    public void invalidatePrefix(String prefix) {
        invalidatePrefix(shortCache, prefix);
        invalidatePrefix(normalCache, prefix);
        invalidatePrefix(longCache, prefix);
        invalidateRedisPrefix(prefix);
    }

    public void invalidateAll() {
        shortCache.invalidateAll();
        normalCache.invalidateAll();
        longCache.invalidateAll();
        deleteRedisPattern(REDIS_KEY_PREFIX + "*");
    }

    @SuppressWarnings("unchecked")
    private <T> T get(Cache<String, Object> cache, String key, Duration redisTtl, Supplier<T> loader) {
        Object cached = cache.getIfPresent(key);
        if (cached != null) {
            CacheTrace.mark("local");
            return (T) cached;
        }
        T value = loadWithRedis(key, redisTtl, loader);
        if (value != null) {
            cache.put(key, value);
        }
        return value;
    }

    @SuppressWarnings("unchecked")
    private <T> T loadWithRedis(String key, Duration ttl, Supplier<T> loader) {
        RedisTemplate<String, Object> redisTemplate = redisTemplate();
        if (redisTemplate != null) {
            try {
                Object value = redisTemplate.opsForValue().get(redisKey(key));
                if (value != null) {
                    CacheTrace.mark("redis");
                    return (T) value;
                }
            } catch (RuntimeException ex) {
                disableRedisTemporarily(ex);
            }
        }

        CacheTrace.mark("database");
        T value = loader.get();
        redisTemplate = redisTemplate();
        if (redisTemplate != null && value != null) {
            try {
                redisTemplate.opsForValue().set(redisKey(key), value, ttl);
            } catch (RuntimeException ex) {
                disableRedisTemporarily(ex);
            }
        }
        return value;
    }

    private void invalidatePrefix(Cache<String, Object> cache, String prefix) {
        cache.asMap().keySet().removeIf(key -> key.equals(prefix) || key.startsWith(prefix + ":"));
    }

    private void invalidateRedisPrefix(String prefix) {
        deleteRedisKey(REDIS_KEY_PREFIX + prefix);
        deleteRedisPattern(REDIS_KEY_PREFIX + prefix + ":*");
    }

    private void deleteRedisKey(String key) {
        RedisTemplate<String, Object> redisTemplate = redisTemplate();
        if (redisTemplate == null) {
            return;
        }
        try {
            redisTemplate.delete(key);
        } catch (RuntimeException ex) {
            disableRedisTemporarily(ex);
        }
    }

    private void deleteRedisPattern(String pattern) {
        RedisTemplate<String, Object> redisTemplate = redisTemplate();
        if (redisTemplate == null) {
            return;
        }
        try {
            var keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (RuntimeException ex) {
            disableRedisTemporarily(ex);
        }
    }

    private RedisTemplate<String, Object> redisTemplate() {
        if (redisTemplateProvider == null) {
            return null;
        }
        if (System.currentTimeMillis() < redisDisabledUntilMillis) {
            CacheTrace.mark("redis-unavailable");
            return null;
        }
        return redisTemplateProvider.getIfAvailable();
    }

    private String redisKey(String key) {
        return REDIS_KEY_PREFIX + key;
    }

    private void disableRedisTemporarily(RuntimeException ex) {
        boolean shouldLog = System.currentTimeMillis() >= redisDisabledUntilMillis;
        CacheTrace.mark("redis-unavailable");
        redisDisabledUntilMillis = System.currentTimeMillis() + REDIS_BACKOFF.toMillis();
        if (shouldLog) {
            log.warn("Redis 不可用，{} 秒内跳过 Redis 缓存并降级到本地缓存/数据库：{}", REDIS_BACKOFF.toSeconds(), ex.getMessage());
        }
    }

    private String digest(Object[] parts) {
        try {
            return DigestUtils.md5DigestAsHex(objectMapper.writeValueAsBytes(parts));
        } catch (JsonProcessingException ex) {
            return DigestUtils.md5DigestAsHex(Arrays.deepToString(parts).getBytes(StandardCharsets.UTF_8));
        }
    }
}
