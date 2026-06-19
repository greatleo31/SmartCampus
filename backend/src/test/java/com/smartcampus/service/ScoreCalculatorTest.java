package com.smartcampus.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ScoreCalculatorTest {
    @Test
    void shouldCalculateWeightedTotalScore() {
        BigDecimal total = ScoreCalculator.total(new BigDecimal("70"), new BigDecimal("52"));
        assertThat(total).isEqualByComparingTo("59.20");
    }
}
