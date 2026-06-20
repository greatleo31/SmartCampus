package com.smartcampus.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {
    public static final String JDBC_URL = "jdbc:mysql://localhost:3306/smart_campus?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai";
    public static final String USERNAME = "root";
    public static final String PASSWORD = "123456";

    @Bean
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setJdbcUrl(JDBC_URL);
        dataSource.setUsername(USERNAME);
        dataSource.setPassword(PASSWORD);
        return dataSource;
    }
}
