package com.shyler.blog.content;

import com.shyler.blog.diary.MarkdownParser;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static com.shyler.blog.content.ContentModels.Post;
import static com.shyler.blog.content.ContentModels.PostInput;

@Service
public class MarkdownImportService {
    private static final long MAX_MARKDOWN_BYTES = 2L * 1024 * 1024;
    private static final long MAX_ARCHIVE_BYTES = 200L * 1024 * 1024;
    private static final int MAX_ARCHIVE_ENTRIES = 2_000;
    private static final Pattern IMAGE = Pattern.compile("!\\[([^]]*)]\\(([^)]+)\\)");
    private static final Pattern H1 = Pattern.compile("(?m)^#\\s+(.+)$");

    private final AssetService assets;
    private final ContentRepository repository;

    public MarkdownImportService(AssetService assets, ContentRepository repository) {
        this.assets = assets;
        this.repository = repository;
    }

    public ImportResult importBundle(MultipartFile document, List<MultipartFile> images,
                                     List<String> paths, Long categoryId) throws IOException {
        String name = Optional.ofNullable(document.getOriginalFilename()).orElse("article.md");
        Bundle bundle = name.toLowerCase(Locale.ROOT).endsWith(".zip")
                ? unzip(document) : fromMultipart(document, images, paths);
        return importMarkdown(bundle.markdownName, bundle.markdown, bundle.files, categoryId);
    }

    public ImportResult importMarkdown(String filename, byte[] markdown, Map<String, BundleFile> files,
                                       Long categoryId) throws IOException {
        if (markdown.length > MAX_MARKDOWN_BYTES) throw new IllegalArgumentException("Markdown exceeds 2 MB");
        String raw = new String(markdown, StandardCharsets.UTF_8);
        MarkdownParser.ParsedMarkdown parsed = MarkdownParser.parse(raw);
        String content = parsed.body();
        Map<String, String> uploaded = new LinkedHashMap<>();
        Set<String> unresolved = new LinkedHashSet<>();

        Matcher matcher = IMAGE.matcher(content);
        StringBuffer rewritten = new StringBuffer();
        while (matcher.find()) {
            String ref = cleanReference(matcher.group(2));
            if (!isLocalReference(ref)) continue;
            Match match = match(ref, files);
            if (match.ambiguous || match.file == null) {
                unresolved.add(ref);
                continue;
            }
            ContentModels.Asset asset = assets.store(match.file.name, match.file.bytes);
            uploaded.put(ref, asset.url());
            matcher.appendReplacement(rewritten, Matcher.quoteReplacement("![" + matcher.group(1) + "](" + asset.url() + ")"));
        }
        matcher.appendTail(rewritten);
        content = rewritten.toString();

        String slug = safeSlug(filename.replaceFirst("(?i)\\.md$", ""));
        if (repository.findPost(slug, false).isPresent()) throw new ContentRepository.Conflict("An article with this slug already exists");
        String title = parsed.fields().getOrDefault("title", extractTitle(content, slug));
        String summary = parsed.fields().getOrDefault("summary", extractSummary(content));
        Post saved = repository.savePost(new PostInput(slug, title, summary, content, categoryId,
                null, "draft", false, null), unresolved.size());
        return new ImportResult(saved, List.copyOf(unresolved), uploaded);
    }

    public static List<String> unresolvedLocalReferences(String content) {
        Set<String> refs = new LinkedHashSet<>();
        Matcher matcher = IMAGE.matcher(content == null ? "" : content);
        while (matcher.find()) {
            String ref = cleanReference(matcher.group(2));
            if (isLocalReference(ref)) refs.add(ref);
        }
        return List.copyOf(refs);
    }

    public static String extractTitle(String content, String fallback) {
        Matcher matcher = H1.matcher(content == null ? "" : content);
        return matcher.find() ? matcher.group(1).trim() : fallback;
    }

    public static String extractSummary(String content) {
        if (content == null) return "";
        for (String block : content.split("\\R\\s*\\R")) {
            String source = block.strip();
            if (source.startsWith("#") || source.startsWith("```") || source.startsWith("!") || source.startsWith("---")) continue;
            String line = source.replaceAll("[`*_>#]", "").replaceAll("\\s+", " ");
            if (!line.isBlank()) {
                return line.substring(0, Math.min(180, line.length()));
            }
        }
        return "";
    }

    private Bundle fromMultipart(MultipartFile document, List<MultipartFile> images, List<String> paths) throws IOException {
        String name = Optional.ofNullable(document.getOriginalFilename()).orElse("article.md");
        if (!name.toLowerCase(Locale.ROOT).endsWith(".md")) throw new IllegalArgumentException("Upload a .md file or .zip bundle");
        Map<String, BundleFile> files = new LinkedHashMap<>();
        if (images != null) {
            for (int i = 0; i < images.size(); i++) {
                MultipartFile image = images.get(i);
                String original = Optional.ofNullable(image.getOriginalFilename()).orElse("image-" + i);
                String path = paths != null && i < paths.size() && !paths.get(i).isBlank() ? paths.get(i) : original;
                files.put(normalize(path), new BundleFile(original, image.getBytes()));
            }
        }
        return new Bundle(name, document.getBytes(), files);
    }

    private Bundle unzip(MultipartFile archive) throws IOException {
        if (archive.getSize() > MAX_ARCHIVE_BYTES) throw new IllegalArgumentException("ZIP exceeds 200 MB");
        Map<String, BundleFile> files = new LinkedHashMap<>();
        byte[] markdown = null; String markdownName = null; long total = 0; int entries = 0;
        try (ZipInputStream zip = new ZipInputStream(archive.getInputStream(), StandardCharsets.UTF_8)) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if (entry.isDirectory()) continue;
                if (++entries > MAX_ARCHIVE_ENTRIES) throw new IllegalArgumentException("ZIP contains too many files");
                String path = normalize(entry.getName());
                if (path.startsWith("../") || path.contains("/../")) throw new IllegalArgumentException("Unsafe ZIP path");
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                byte[] buffer = new byte[8192]; int read;
                while ((read = zip.read(buffer)) != -1) {
                    total += read;
                    if (total > MAX_ARCHIVE_BYTES) throw new IllegalArgumentException("ZIP expands beyond 200 MB");
                    out.write(buffer, 0, read);
                }
                byte[] bytes = out.toByteArray();
                if (path.toLowerCase(Locale.ROOT).endsWith(".md")) {
                    if (markdown != null) throw new IllegalArgumentException("ZIP must contain exactly one Markdown file");
                    markdown = bytes; markdownName = basename(path);
                } else {
                    files.put(path, new BundleFile(basename(path), bytes));
                }
            }
        }
        if (markdown == null) throw new IllegalArgumentException("ZIP does not contain a Markdown file");
        return new Bundle(markdownName, markdown, files);
    }

    private static Match match(String reference, Map<String, BundleFile> files) {
        String normalized = normalize(reference).replaceFirst("^[A-Za-z]:/", "").replaceFirst("^\\./", "");
        List<BundleFile> exact = files.entrySet().stream()
                .filter(e -> e.getKey().equals(normalized) || e.getKey().endsWith("/" + normalized))
                .map(Map.Entry::getValue).toList();
        if (exact.size() == 1) return new Match(exact.getFirst(), false);
        String base = basename(normalized);
        List<BundleFile> byName = files.values().stream().filter(f -> f.name.equals(base)).toList();
        return byName.size() == 1 ? new Match(byName.getFirst(), false) : new Match(null, byName.size() > 1 || exact.size() > 1);
    }

    private static String cleanReference(String ref) {
        String value = ref.strip();
        if (value.startsWith("<") && value.endsWith(">")) value = value.substring(1, value.length() - 1);
        return value;
    }

    private static boolean isLocalReference(String ref) {
        String lower = ref.toLowerCase(Locale.ROOT);
        return !(lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("//")
                || lower.startsWith("data:") || lower.startsWith("/media/") || lower.startsWith("/posts/")
                || lower.startsWith("/image/") || lower.startsWith("/diaries/"));
    }

    private static String normalize(String path) { return path.replace('\\', '/').replaceAll("^/+", ""); }
    private static String basename(String path) { String n = normalize(path); return n.substring(n.lastIndexOf('/') + 1); }
    private static String safeSlug(String value) {
        String slug = value.strip().replaceAll("[^a-zA-Z0-9._-]+", "-").replaceAll("^-+|-+$", "");
        if (slug.isBlank()) throw new IllegalArgumentException("Filename cannot produce a valid slug");
        return slug;
    }

    private record Bundle(String markdownName, byte[] markdown, Map<String, BundleFile> files) {}
    private record BundleFile(String name, byte[] bytes) {}
    private record Match(BundleFile file, boolean ambiguous) {}
    public record ImportResult(Post post, List<String> unresolvedImages, Map<String, String> uploadedImages) {}
}
