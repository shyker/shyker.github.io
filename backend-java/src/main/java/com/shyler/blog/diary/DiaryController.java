package com.shyler.blog.diary;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/diaries")
public class DiaryController {

    private static final Logger log = LoggerFactory.getLogger(DiaryController.class);

    private final DiaryRepository diaryRepository;

    public DiaryController(DiaryRepository diaryRepository) {
        this.diaryRepository = diaryRepository;
    }

    @GetMapping
    public List<DiaryEntry> listDiaries() {
        return diaryRepository.findAll();
    }

    @GetMapping("/{slug}")
    public ResponseEntity<DiaryEntry> getDiary(@PathVariable String slug) {
        return diaryRepository.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Uploads a Markdown (.md) file, parses its frontmatter, and persists it.
     *
     * <p>The file is validated to ensure it has a {@code .md} extension. The
     * slug is derived from the original filename (minus the {@code .md} suffix).
     * Frontmatter fields (title, date, mood, weather, summary) are extracted by
     * {@link MarkdownParser}; any missing fields fall back to sensible defaults.</p>
     *
     * @param file the uploaded Markdown file
     * @return the created {@link DiaryEntry}, or a 400 error if validation fails
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadDiary(@RequestParam("file") MultipartFile file) {
        String originalFilename = file.getOriginalFilename();

        // --- Validate file extension ---
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".md")) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Only .md files are accepted")
            );
        }

        // --- Read file content ---
        String raw;
        try {
            raw = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to read uploaded file", e);
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Failed to read uploaded file")
            );
        }

        // --- Parse frontmatter ---
        MarkdownParser.ParsedMarkdown parsed;
        try {
            parsed = MarkdownParser.parse(raw);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Invalid Markdown frontmatter: " + e.getMessage())
            );
        }

        Map<String, String> fm = parsed.fields();
        String slug = originalFilename.replaceAll("(?i)\\.md$", "");

        String title = fm.getOrDefault("title", slug);
        LocalDate date = fm.containsKey("date")
                ? LocalDate.parse(fm.get("date"))
                : LocalDate.now();
        String mood = fm.getOrDefault("mood", "");
        String weather = fm.getOrDefault("weather", "");
        String summary = fm.getOrDefault("summary", "");
        String tags = fm.getOrDefault("tags", "");

        DiaryEntry entry = new DiaryEntry(slug, title, date, mood, weather, summary, tags, parsed.body());

        try {
            DiaryEntry saved = diaryRepository.addEntry(entry);
            log.info("Uploaded diary: slug={}", saved.slug());
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            log.error("Failed to persist uploaded diary", e);
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Failed to save diary entry")
            );
        }
    }

    /**
     * Uploads a Markdown file together with its referenced local images.
     * Image paths in the markdown are automatically rewritten to served URLs.
     */
    @PostMapping("/upload-with-images")
    public ResponseEntity<?> uploadDiaryWithImages(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".md")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only .md files are accepted"));
        }

        String raw;
        try {
            raw = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to read file"));
        }

        MarkdownParser.ParsedMarkdown parsed;
        try {
            parsed = MarkdownParser.parse(raw);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid frontmatter: " + e.getMessage()));
        }

        Map<String, String> fm = parsed.fields();
        String slug = originalFilename.replaceAll("(?i)\\.md$", "");
        String body = parsed.body();

        // Process images: save + rewrite paths in markdown
        if (images != null) {
            for (MultipartFile img : images) {
                if (img.isEmpty()) continue;
                String imgName = img.getOriginalFilename();
                if (imgName == null) continue;

                String contentType = img.getContentType();
                if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) continue;

                String ext = switch (contentType) {
                    case "image/png" -> ".png";
                    case "image/jpeg" -> ".jpg";
                    case "image/gif" -> ".gif";
                    case "image/webp" -> ".webp";
                    case "image/svg+xml" -> ".svg";
                    default -> ".png";
                };

                String uuidName = UUID.randomUUID() + ext;
                String newUrl = "/diaries/images/" + uuidName;

                try {
                    Files.createDirectories(IMAGE_DIR);
                    Files.createDirectories(IMAGE_SERVE_DIR);
                    Path dest = IMAGE_DIR.resolve(uuidName);
                    img.transferTo(dest);
                    Files.copy(dest, IMAGE_SERVE_DIR.resolve(uuidName), StandardCopyOption.REPLACE_EXISTING);
                } catch (IOException e) {
                    log.error("Failed to save image: {}", imgName, e);
                    continue;
                }

                // Replace markdown image refs whose filename matches exactly
                java.util.regex.Pattern imgPattern =
                        java.util.regex.Pattern.compile("!\\[([^\\]]*)\\]\\(([^)]+)\\)");
                java.util.regex.Matcher matcher = imgPattern.matcher(body);
                StringBuffer sb = new StringBuffer();
                while (matcher.find()) {
                    String alt = matcher.group(1);
                    String path = matcher.group(2);
                    // Extract just the filename (last segment after \ or /)
                    String fname = path.replaceAll("^.*[/\\\\]", "");
                    if (fname.equals(imgName)) {
                        matcher.appendReplacement(sb,
                                java.util.regex.Matcher.quoteReplacement(
                                        "![" + alt + "](" + newUrl + ")"));
                    }
                }
                matcher.appendTail(sb);
                body = sb.toString();

                log.info("Image mapped: {} -> {}", imgName, newUrl);
            }
        }

        String title = fm.getOrDefault("title", slug);
        LocalDate date = fm.containsKey("date") ? LocalDate.parse(fm.get("date")) : LocalDate.now();
        String mood = fm.getOrDefault("mood", "");
        String weather = fm.getOrDefault("weather", "");
        String summary = fm.getOrDefault("summary", "");
        String tags = fm.getOrDefault("tags", "");

        DiaryEntry entry = new DiaryEntry(slug, title, date, mood, weather, summary, tags, body);

        try {
            DiaryEntry saved = diaryRepository.addEntry(entry);
            log.info("Uploaded diary with images: slug={}", saved.slug());
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to save diary entry"));
        }
    }

    /**
     * Updates fields of an existing diary entry.
     * Supported keys: title, date, content. Omitted or null fields are left unchanged.
     */
    @PutMapping("/{slug}")
    public ResponseEntity<?> updateDiary(
            @PathVariable String slug,
            @RequestBody Map<String, String> body) {

        var existing = diaryRepository.findBySlug(slug);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String newTitle = body.get("title");
        String newContent = body.get("content");
        String newTags = body.get("tags");

        LocalDate newDate = null;
        if (body.containsKey("date") && body.get("date") != null && !body.get("date").isBlank()) {
            try {
                newDate = LocalDate.parse(body.get("date"));
            } catch (DateTimeParseException e) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Invalid date format, expected YYYY-MM-DD")
                );
            }
        }

        var updated = diaryRepository.updateEntry(slug, newTitle, newDate, newContent, newTags);
        return updated
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Deletes a diary entry by slug (removes the .md file and in-memory record).
     */
    @DeleteMapping("/{slug}")
    public ResponseEntity<?> deleteDiary(@PathVariable String slug) {
        boolean deleted = diaryRepository.deleteEntry(slug);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        log.info("Deleted diary: slug={}", slug);
        return ResponseEntity.ok(Map.of("deleted", slug));
    }

    // -------------------------------------------------------------------
    // Image upload
    // -------------------------------------------------------------------

    private static final Path IMAGE_DIR = Paths.get("../diaries/images").toAbsolutePath().normalize();
    private static final Path IMAGE_SERVE_DIR = Paths.get("../public/diaries/images").toAbsolutePath().normalize();
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"
    );

    /**
     * Uploads an image to be embedded in diary Markdown content.
     *
     * @return JSON with the public URL of the uploaded image
     */
    @PostMapping("/images")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Unsupported image type. Allowed: png, jpg, jpeg, gif, webp, svg")
            );
        }

        // Derive extension
        String ext = switch (contentType) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            case "image/svg+xml" -> ".svg";
            default -> ".png";
        };

        String filename = UUID.randomUUID() + ext;

        try {
            Files.createDirectories(IMAGE_DIR);
            Path target = IMAGE_DIR.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            // mirror to public/ for Next.js serving
            Files.createDirectories(IMAGE_SERVE_DIR);
            Files.copy(target, IMAGE_SERVE_DIR.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to save uploaded image", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to save image"));
        }

        String url = "/diaries/images/" + filename;
        log.info("Image uploaded: {}", url);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
