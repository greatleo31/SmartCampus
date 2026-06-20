package com.smartcampus.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WarningRuleEngineTest {
    @Test
    void shouldGenerateHighRiskForThreeAbsences() {
        WarningRuleEngine.WarningDecision decision = WarningRuleEngine.evaluate(3, 1);
        assertThat(decision.level()).isEqualTo("HIGH");
        assertThat(decision.reason()).contains("旷课 3 次", "迟到/早退 1 次");
    }

    @Test
    void shouldGenerateMediumRiskForTwoAbsencesOrFourLateEarly() {
        assertThat(WarningRuleEngine.evaluate(2, 0).level()).isEqualTo("MEDIUM");
        assertThat(WarningRuleEngine.evaluate(0, 4).level()).isEqualTo("MEDIUM");
    }

    @Test
    void shouldGenerateLowRiskForOneAbsenceOrTwoLateEarly() {
        assertThat(WarningRuleEngine.evaluate(1, 0).level()).isEqualTo("LOW");
        assertThat(WarningRuleEngine.evaluate(0, 2).level()).isEqualTo("LOW");
    }

    @Test
    void shouldNotWarnForNormalAttendance() {
        WarningRuleEngine.WarningDecision decision = WarningRuleEngine.evaluate(0, 1);
        assertThat(decision.hasWarning()).isFalse();
    }
}
