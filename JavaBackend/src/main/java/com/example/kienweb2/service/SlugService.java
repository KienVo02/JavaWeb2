package com.example.kienweb2.service;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class SlugService {

    private static final Pattern NON_ASCII = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Pattern NON_SLUG_CHAR = Pattern.compile("[^a-z0-9]+");

    public String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "item";
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replace("đ", "d")
                .replace("Đ", "D");
        String noAccent = NON_ASCII.matcher(normalized).replaceAll("");
        String slug = NON_SLUG_CHAR.matcher(noAccent.toLowerCase(Locale.ROOT)).replaceAll("-");
        slug = slug.replaceAll("^-+|-+$", "");

        return slug.isBlank() ? "item" : slug;
    }
}
