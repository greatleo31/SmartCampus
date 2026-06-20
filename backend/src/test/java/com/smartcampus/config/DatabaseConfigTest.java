package com.smartcampus.config;

import com.zaxxer.hikari.HikariDataSource;
import org.junit.jupiter.api.Test;

import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.assertThat;

class DatabaseConfigTest {
    @Test
    void shouldUseFixedDemoDatabaseConnection() {
        DataSource dataSource = new DatabaseConfig().dataSource();

        assertThat(dataSource).isInstanceOf(HikariDataSource.class);
        HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
        assertThat(hikariDataSource.getJdbcUrl()).isEqualTo(DatabaseConfig.JDBC_URL);
        assertThat(hikariDataSource.getUsername()).isEqualTo("root");
        assertThat(hikariDataSource.getPassword()).isEqualTo("123456");
    }
}
