package com.smartcampus.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordEncodingTest {
    @Test
    void shouldUseBcryptHashInsteadOfPlainPassword() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "UnitTestPassword#123";
        String hash = encoder.encode(rawPassword);
        assertThat(hash).isNotEqualTo(rawPassword);
        assertThat(hash).startsWith("$2");
        assertThat(encoder.matches(rawPassword, hash)).isTrue();
    }
}
