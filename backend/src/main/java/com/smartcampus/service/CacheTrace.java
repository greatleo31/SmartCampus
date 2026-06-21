package com.smartcampus.service;

import java.util.LinkedHashSet;
import java.util.Set;

public final class CacheTrace {
    private static final ThreadLocal<Set<String>> SOURCES = ThreadLocal.withInitial(LinkedHashSet::new);

    private CacheTrace() {
    }

    public static void mark(String source) {
        SOURCES.get().add(source);
    }

    public static String consume() {
        Set<String> sources = SOURCES.get();
        try {
            return sources.isEmpty() ? "" : String.join(",", sources);
        } finally {
            SOURCES.remove();
        }
    }
}
