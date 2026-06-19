package com.smartcampus.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class ScoreCalculator {
    private ScoreCalculator() {
    }

    public static BigDecimal total(BigDecimal regularScore, BigDecimal finalScore) {
        return regularScore.multiply(new BigDecimal("0.4"))
                .add(finalScore.multiply(new BigDecimal("0.6")))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
