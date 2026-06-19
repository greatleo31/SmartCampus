package com.smartcampus.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class WarningRuleEngineTest {
    @Test
    void shouldGenerateHighRiskForFailedScoreAndAbsence() {
        WarningRuleEngine.WarningDecision decision = WarningRuleEngine.evaluate(new BigDecimal("58"), 1, 0);
        assertThat(decision.level()).isEqualTo("HIGH");
        assertThat(decision.reason()).contains("总评低于60", "旷课");
    }

    @Test
    void shouldGenerateLowRiskForBorderlineScore() {
        WarningRuleEngine.WarningDecision decision = WarningRuleEngine.evaluate(new BigDecimal("68"), 0, 0);
        assertThat(decision.level()).isEqualTo("LOW");
    }

    @Test
    void shouldNotWarnForNormalStudent() {
        WarningRuleEngine.WarningDecision decision = WarningRuleEngine.evaluate(new BigDecimal("88"), 0, 1);
        assertThat(decision.hasWarning()).isFalse();
    }
}
