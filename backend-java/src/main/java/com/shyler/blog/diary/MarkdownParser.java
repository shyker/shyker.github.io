package com.shyler.blog.diary;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Simple utility to parse YAML-like frontmatter from a Markdown (.md) file.
 *
 * <p>The expected format mirrors the frontend convention established by the
 * TypeScript {@code gray-matter} library in {@code src/lib/diaries.ts}:</p>
 *
 * <pre>
 * ---
 * title: "My Title"
 * date: "2026-07-06"
 * mood: "happy"
 * weather: "sunny"
 * summary: "A short summary"
 * ---
 * Content here...
 * </pre>
 */
public final class MarkdownParser {

    private MarkdownParser() {
        // utility class — no instantiation
    }

    private static final Pattern FRONTMATTER_KEY_VALUE =
            Pattern.compile("^([a-zA-Z_][a-zA-Z0-9_]*)\\s*:\\s*\"([^\"]*)\"\\s*$");

    /**
     * Parses the raw text of a Markdown file and separates frontmatter from content.
     *
     * @param raw the full file contents as a UTF-8 string
     * @return a {@link ParsedMarkdown} record holding extracted fields and the body
     * @throws IllegalArgumentException if the frontmatter block is malformed
     */
    public static ParsedMarkdown parse(String raw) {
        String trimmed = raw.stripLeading();
        if (!trimmed.startsWith("---")) {
            // No frontmatter block — treat the entire file as content
            return new ParsedMarkdown(Map.of(), trimmed);
        }

        int secondDelim = trimmed.indexOf("---", 3);
        if (secondDelim == -1) {
            throw new IllegalArgumentException("Unclosed frontmatter block (missing closing ---).");
        }

        String fmBlock = trimmed.substring(3, secondDelim).strip();
        String body = trimmed.substring(secondDelim + 3).strip();

        Map<String, String> fields = new LinkedHashMap<>();
        for (String line : fmBlock.split("\\R")) {
            String stripped = line.strip();
            if (stripped.isEmpty()) {
                continue;
            }
            Matcher m = FRONTMATTER_KEY_VALUE.matcher(stripped);
            if (m.matches()) {
                fields.put(m.group(1), m.group(2));
            }
        }

        return new ParsedMarkdown(fields, body);
    }

    /**
     * Holds the result of parsing a Markdown file.
     *
     * @param fields the frontmatter key-value pairs (never null)
     * @param body   the content after the frontmatter block (never null)
     */
    public record ParsedMarkdown(Map<String, String> fields, String body) {
    }
}
