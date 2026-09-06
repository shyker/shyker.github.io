package com.shyler.blog.content;

import com.shyler.blog.diary.MarkdownParser;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import static com.shyler.blog.content.ContentModels.*;

@Component
public class ContentSeeder {
    private static final Logger log = LoggerFactory.getLogger(ContentSeeder.class);
    private final ContentRepository repository;

    @Value("${app.content.seed-dir}") private String seedDir;

    public ContentSeeder(ContentRepository repository) { this.repository = repository; }

    @PostConstruct
    void seed() {
        try {
            Category security = ensureCategory("security-notes", "安全笔记", "漏洞、安全服务与实践记录", 10);
            Category ctf = ensureCategory("ctf-writeups", "CTF Writeups", "题目分析、流量取证与逆向记录", 20);
            Category others = ensureCategory("others", "Others", "随笔、关系、阅读与未归档文字", 30);
            Map<String, Long> category = Map.ofEntries(
                    Map.entry("redis1", security.id()), Map.entry("redis2", security.id()),
                    Map.entry("cve-2026-24061", security.id()), Map.entry("openclaw", security.id()),
                    Map.entry("CTFplus", ctf.id()), Map.entry("re1", ctf.id()),
                    Map.entry("steganography", ctf.id()), Map.entry("traffic", ctf.id()),
                    Map.entry("worm", others.id()), Map.entry("whoami", others.id()),
                    Map.entry("WhatIveLearnFromMentor", others.id()), Map.entry("TheCommunistManifesto", others.id()),
                    Map.entry("thefirst", others.id()), Map.entry("together", others.id()), Map.entry("about", others.id())
            );
            Path root = Path.of(seedDir).toAbsolutePath().normalize();
            if (!Files.isDirectory(root)) { log.info("Content seed directory not present: {}", root); return; }
            try (var stream = Files.list(root)) {
                for (Path file : stream.filter(p -> p.getFileName().toString().endsWith(".md")).toList()) {
                    String slug = file.getFileName().toString().replaceFirst("(?i)\\.md$", "");
                    if (repository.findPost(slug, false).isPresent() || !category.containsKey(slug)) continue;
                    String raw = Files.readString(file, StandardCharsets.UTF_8);
                    var parsed = MarkdownParser.parse(raw);
                    String title = parsed.fields().getOrDefault("title", MarkdownImportService.extractTitle(parsed.body(), slug));
                    String summary = parsed.fields().getOrDefault("summary", MarkdownImportService.extractSummary(parsed.body()));
                    String publicPath = switch (slug) {
                        case "about" -> "/about";
                        case "thefirst" -> "/whosheis";
                        case "together" -> "/together";
                        default -> null;
                    };
                    int unresolved = MarkdownImportService.unresolvedLocalReferences(parsed.body()).size();
                    repository.savePost(new PostInput(slug, title, summary, parsed.body(), category.get(slug),
                            publicPath, "published", unresolved > 0, null), unresolved);
                }
            }
        } catch (Exception e) {
            log.error("Could not seed blog content", e);
        }
    }

    private Category ensureCategory(String slug, String name, String description, int order) {
        return repository.findCategoryBySlug(slug, false).orElseGet(() ->
                repository.createCategory(new CategoryInput(slug, name, description, null, order, true)));
    }
}
