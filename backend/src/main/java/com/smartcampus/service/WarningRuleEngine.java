package com.smartcampus.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public final class WarningRuleEngine {
    private WarningRuleEngine() {
    }

    public static WarningDecision evaluate(BigDecimal totalScore, long absentCount, long lateOrEarlyCount) {
        List<String> reasons = new ArrayList<>();
        int risk = 0;
        if (totalScore != null && totalScore.compareTo(new BigDecimal("60")) < 0) {
            risk += 2;
            reasons.add("总评低于60");
        } else if (totalScore != null && totalScore.compareTo(new BigDecimal("70")) < 0) {
            risk += 1;
            reasons.add("总评低于70");
        }
        if (absentCount >= 2) {
            risk += 2;
            reasons.add("旷课次数达到2次");
        } else if (absentCount == 1) {
            risk += 1;
            reasons.add("存在旷课记录");
        }
        if (lateOrEarlyCount >= 3) {
            risk += 1;
            reasons.add("迟到或早退次数达到3次");
        }
        if (risk >= 3) {
            return new WarningDecision("HIGH", String.join("；", reasons));
        }
        if (risk == 2) {
            return new WarningDecision("MEDIUM", String.join("；", reasons));
        }
        if (risk == 1) {
            return new WarningDecision("LOW", String.join("；", reasons));
        }
        return new WarningDecision(null, null);
    }

    public record WarningDecision(String level, String reason) {
        public boolean hasWarning() {
            return level != null;
        }
    }
}
