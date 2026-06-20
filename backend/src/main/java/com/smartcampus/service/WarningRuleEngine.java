package com.smartcampus.service;

public final class WarningRuleEngine {
    private WarningRuleEngine() {
    }

    public static WarningDecision evaluate(long absentCount, long lateOrEarlyCount) {
        String reason = "旷课 " + absentCount + " 次；迟到/早退 " + lateOrEarlyCount + " 次";
        if (absentCount >= 3) {
            return new WarningDecision("HIGH", reason);
        }
        if (absentCount == 2 || lateOrEarlyCount >= 4) {
            return new WarningDecision("MEDIUM", reason);
        }
        if (absentCount == 1 || lateOrEarlyCount >= 2) {
            return new WarningDecision("LOW", reason);
        }
        return new WarningDecision(null, null);
    }

    public record WarningDecision(String level, String reason) {
        public boolean hasWarning() {
            return level != null;
        }
    }
}
