package com.shyler.blog.diary;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;

/**
 * File-backed repository for diary entries.
 *
 * <p>Every read goes directly to disk — there is no in-memory cache.
 * This means you can edit or delete .md files manually and the changes
 * appear on the next request without restarting the backend.</p>
 */
@Repository
public class DiaryRepository {

    private static final Logger log = LoggerFactory.getLogger(DiaryRepository.class);

    /** Directory where diary {@code .md} files live. */
    private static final String STORAGE_DIR = "../diaries/posts";

    private Path storagePath;

    @PostConstruct
    void init() {
        storagePath = Paths.get(STORAGE_DIR).toAbsolutePath().normalize();
        try {
            Files.createDirectories(storagePath);
        } catch (IOException e) {
            log.error("Could not create diaries directory: {}", storagePath, e);
            return;
        }
        seedIfEmpty();
    }

    // -----------------------------------------------------------------------
    // Public API — always reads from disk
    // -----------------------------------------------------------------------

    /** Lists all entries, newest date first. */
    public List<DiaryEntry> findAll() {
        List<DiaryEntry> list = new ArrayList<>();
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(storagePath, "*.md")) {
            for (Path file : stream) {
                try {
                    list.add(parseDiaryFile(file));
                } catch (Exception e) {
                    log.warn("Skipping unparseable file: {}", file.getFileName(), e);
                }
            }
        } catch (IOException e) {
            log.error("Failed to list diary files in {}", storagePath, e);
        }
        list.sort(Comparator.comparing(DiaryEntry::date).reversed());
        return list;
    }

    /** Finds a single entry by slug (filename minus {@code .md}). */
    public Optional<DiaryEntry> findBySlug(String slug) {
        Path file = storagePath.resolve(slug + ".md");
        if (!Files.exists(file)) return Optional.empty();
        try {
            return Optional.of(parseDiaryFile(file));
        } catch (IOException e) {
            log.error("Failed to read diary file: {}", file, e);
            return Optional.empty();
        }
    }

    /** Persists a new entry to disk. */
    public DiaryEntry addEntry(DiaryEntry entry) throws IOException {
        writeMarkdownFile(entry);
        log.info("Diary entry added: slug={}, title={}", entry.slug(), entry.title());
        return entry;
    }

    /** Updates an existing entry on disk. Returns empty if slug not found. */
    public Optional<DiaryEntry> updateEntry(String slug, String newTitle, LocalDate newDate,
                                            String newContent, String newTags) {
        var existing = findBySlug(slug);
        if (existing.isEmpty()) return Optional.empty();

        DiaryEntry old = existing.get();
        DiaryEntry updated = new DiaryEntry(
                slug,
                newTitle != null && !newTitle.isBlank() ? newTitle : old.title(),
                newDate != null ? newDate : old.date(),
                old.mood(),
                old.weather(),
                old.summary(),
                newTags != null ? newTags : old.tags(),
                newContent != null ? newContent : old.content()
        );

        try {
            writeMarkdownFile(updated);
            log.info("Diary entry updated: slug={}", slug);
        } catch (IOException e) {
            log.error("Failed to write updated diary file for slug={}", slug, e);
        }

        return Optional.of(updated);
    }

    /** Deletes an entry from disk. Returns false if not found. */
    public boolean deleteEntry(String slug) {
        Path file = storagePath.resolve(slug + ".md");
        try {
            boolean existed = Files.deleteIfExists(file);
            if (existed) log.info("Diary entry deleted: slug={}", slug);
            return existed;
        } catch (IOException e) {
            log.error("Failed to delete diary file for slug={}", slug, e);
            return false;
        }
    }

    // -----------------------------------------------------------------------
    // Persistence helpers
    // -----------------------------------------------------------------------

    /** Seeds a default entry if the posts directory is completely empty. */
    private void seedIfEmpty() {
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(storagePath, "*.md")) {
            if (stream.iterator().hasNext()) return; // already has files
        } catch (IOException e) {
            return;
        }

        DiaryEntry seed = new DiaryEntry(
                "2026-07-06",
                "First diary scaffold",
                LocalDate.of(2026, 7, 6),
                "quiet",
                "late summer",
                "A small entry used to shape the diary page before the Java publishing flow arrives.",
                "",
                """
                        ## Today

                        This is the first placeholder diary entry. It gives the `/diaries`\
                         route something real to render while the Java backend grows into the\
                         publishing and upload service.

                        ## Notes

                        - Keep the writing plain.
                        - Keep the route public.
                        - Let the admin-only parts live under the Java `/api/admin` surface later.
                        """
        );
        try {
            writeMarkdownFile(seed);
            log.info("Seeded default diary entry.");
        } catch (IOException e) {
            log.error("Failed to write seed diary file.", e);
        }
    }

    private static DiaryEntry parseDiaryFile(Path file) throws IOException {
        String raw = Files.readString(file);
        MarkdownParser.ParsedMarkdown parsed = MarkdownParser.parse(raw);

        Map<String, String> fm = parsed.fields();
        String slug = file.getFileName().toString().replace(".md", "");

        String title = fm.getOrDefault("title", slug);
        LocalDate date = fm.containsKey("date")
                ? LocalDate.parse(fm.get("date"))
                : LocalDate.now();
        String mood = fm.getOrDefault("mood", "");
        String weather = fm.getOrDefault("weather", "");
        String summary = fm.getOrDefault("summary", "");
        String tags = fm.getOrDefault("tags", "");

        return new DiaryEntry(slug, title, date, mood, weather, summary, tags, parsed.body());
    }

    private void writeMarkdownFile(DiaryEntry entry) throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("---\n");
        sb.append("title: \"").append(entry.title()).append("\"\n");
        sb.append("date: \"").append(entry.date()).append("\"\n");
        if (entry.mood() != null && !entry.mood().isBlank()) {
            sb.append("mood: \"").append(entry.mood()).append("\"\n");
        }
        if (entry.weather() != null && !entry.weather().isBlank()) {
            sb.append("weather: \"").append(entry.weather()).append("\"\n");
        }
        if (entry.summary() != null && !entry.summary().isBlank()) {
            sb.append("summary: \"").append(entry.summary()).append("\"\n");
        }
        if (entry.tags() != null && !entry.tags().isBlank()) {
            sb.append("tags: \"").append(entry.tags()).append("\"\n");
        }
        sb.append("---\n\n");
        sb.append(entry.content());

        Path file = storagePath.resolve(entry.slug() + ".md");
        Files.writeString(file, sb.toString(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }
}
