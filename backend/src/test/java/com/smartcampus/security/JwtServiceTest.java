package com.smartcampus.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {
    @TempDir
    Path tempDir;

    @Test
    void shouldReadJwtSecretFromFileWhenConfiguredSecretIsBlank() throws Exception {
        Path secretFile = tempDir.resolve("jwt-secret.txt");
        Files.writeString(secretFile, "0123456789abcdef0123456789abcdef", StandardCharsets.UTF_8);
        JwtService jwtService = new JwtService("", secretFile.toString(), 120);

        String token = jwtService.generate(new CurrentUser(1L, "admin", "系统管理员", "ADMIN", List.of("ADMIN"), List.of()));
        Claims claims = jwtService.parse(token);

        assertThat(claims.getSubject()).isEqualTo("admin");
        assertThat(claims.get("uid", Integer.class)).isEqualTo(1);
        assertThat(claims.get("ut", String.class)).isEqualTo("ADMIN");
    }

    @Test
    void shouldRejectShortJwtSecret() throws Exception {
        Path secretFile = tempDir.resolve("jwt-secret.txt");
        Files.writeString(secretFile, "short", StandardCharsets.UTF_8);

        assertThatThrownBy(() -> new JwtService("", secretFile.toString(), 120))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("长度不能少于 32");
    }
}
