package com.shyler.blog.diary;

import java.time.LocalDate;

public record DiaryEntry(
        String slug,
        String title,
        LocalDate date,
        String mood,
        String weather,
        String summary,
        String tags,
        String content
) {
}
