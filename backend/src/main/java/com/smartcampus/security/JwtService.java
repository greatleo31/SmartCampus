package com.smartcampus.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
    private static final int MIN_SECRET_LENGTH = 32;

    private final SecretKey key;
    private final long expirationMinutes;

    public JwtService(@Value("${smart-campus.jwt.secret:}") String secret,
                      @Value("${smart-campus.jwt.secret-file:config/jwt-secret.txt}") String secretFile,
                      @Value("${smart-campus.jwt.expiration-minutes:120}") long expirationMinutes) {
        String resolvedSecret = resolveSecret(secret, secretFile);
        this.key = Keys.hmacShaKeyFor(resolvedSecret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
    }

    public String generate(CurrentUser user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.username())
                .claim("uid", user.id())
                .claim("ut", user.userType())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationMinutes * 60)))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    private String resolveSecret(String configuredSecret, String secretFile) {
        if (StringUtils.hasText(configuredSecret)) {
            return requireStrongSecret(configuredSecret.trim(), "smart-campus.jwt.secret");
        }
        if (!StringUtils.hasText(secretFile)) {
            throw new IllegalStateException("JWT 密钥未配置：请设置 SMARTCAMPUS_JWT_SECRET 或 smart-campus.jwt.secret-file");
        }
        Path secretPath = Path.of(secretFile);
        if (!Files.exists(secretPath) && !secretPath.isAbsolute()) {
            Path backendRelativePath = Path.of("backend").resolve(secretFile);
            if (Files.exists(backendRelativePath)) {
                secretPath = backendRelativePath;
            }
        }
        try {
            String fileSecret = Files.readString(secretPath, StandardCharsets.UTF_8).trim();
            return requireStrongSecret(fileSecret, "JWT 密钥文件 " + secretPath);
        } catch (IOException ex) {
            throw new IllegalStateException("无法读取 JWT 密钥文件：" + secretPath.toAbsolutePath(), ex);
        }
    }

    private String requireStrongSecret(String secret, String source) {
        if (secret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(source + " 长度不能少于 " + MIN_SECRET_LENGTH + " 个字符");
        }
        return secret;
    }
}
