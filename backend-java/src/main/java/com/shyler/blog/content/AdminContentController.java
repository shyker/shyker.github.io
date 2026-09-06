package com.shyler.blog.content;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static com.shyler.blog.content.ContentModels.*;

@RestController
@RequestMapping("/api/admin")
public class AdminContentController {
    private final ContentRepository repository;
    private final AssetService assets;
    private final MarkdownImportService importer;
    private final AdminTokenService tokens;
    private final Map<String, LoginWindow> loginWindows = new ConcurrentHashMap<>();

    public AdminContentController(ContentRepository repository, AssetService assets,
                                  MarkdownImportService importer, AdminTokenService tokens) {
        this.repository = repository;
        this.assets = assets;
        this.importer = importer;
        this.tokens = tokens;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        String key = forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
        LoginWindow window = loginWindows.compute(key, (ignored, old) -> old == null || old.expiresAt.isBefore(Instant.now())
                ? new LoginWindow(0, Instant.now().plusSeconds(900)) : old);
        if (window.attempts >= 5) return ResponseEntity.status(429).body(Map.of("error", "Too many login attempts. Try again later."));
        if (!tokens.passwordMatches(body.get("password"))) {
            loginWindows.put(key, new LoginWindow(window.attempts + 1, window.expiresAt));
            return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));
        }
        loginWindows.remove(key);
        return ResponseEntity.ok(Map.of("token", tokens.issue(), "expiresIn", 8 * 3600));
    }

    @GetMapping("/auth/me") public Map<String, Object> me() { return Map.of("authenticated", true, "role", "admin"); }

    @GetMapping("/categories") public List<Category> categories() { return repository.listCategories(false); }
    @PostMapping("/categories") public Category createCategory(@RequestBody CategoryInput input) {
        validateCategory(input); return repository.createCategory(input);
    }
    @PutMapping("/categories/{id}") public Category updateCategory(@PathVariable long id, @RequestBody CategoryInput input) {
        validateCategory(input); return repository.updateCategory(id, input);
    }
    @DeleteMapping("/categories/{id}") public Map<String, Object> deleteCategory(@PathVariable long id) {
        repository.deleteCategory(id); return Map.of("deleted", id);
    }

    @GetMapping("/posts") public List<Post> posts() { return repository.listPosts(null, false); }
    @GetMapping("/posts/{slug}") public Post post(@PathVariable String slug) {
        return repository.findPost(slug, false).orElseThrow(() -> new ContentRepository.NotFound("Article not found"));
    }
    @PostMapping("/posts") public Post createPost(@RequestBody PostInput input) {
        validatePost(input, true);
        if (repository.findPost(input.slug(), false).isPresent()) throw new ContentRepository.Conflict("An article with this slug already exists");
        int unresolved = MarkdownImportService.unresolvedLocalReferences(input.content()).size();
        return repository.savePost(input, unresolved);
    }
    @PutMapping("/posts/{slug}") public Post updatePost(@PathVariable String slug, @RequestBody PostInput input) {
        if (repository.findPost(slug, false).isEmpty()) throw new ContentRepository.NotFound("Article not found");
        PostInput normalized = new PostInput(slug, input.title(), input.summary(), input.content(), input.categoryId(),
                input.publicPath(), input.status(), input.allowMissingImages(), input.version());
        validatePost(normalized, false);
        String content = input.content() == null ? repository.findPost(slug, false).orElseThrow().content() : input.content();
        int unresolved = MarkdownImportService.unresolvedLocalReferences(content).size();
        return repository.savePost(normalized, unresolved);
    }
    @DeleteMapping("/posts/{slug}") public Map<String, Object> deletePost(@PathVariable String slug) {
        repository.deletePost(slug); return Map.of("deleted", slug);
    }

    @GetMapping("/assets") public List<Asset> listAssets() { return repository.listAssets(); }
    @PostMapping("/assets") public Asset uploadAsset(@RequestParam("file") MultipartFile file) throws IOException {
        return assets.store(file);
    }
    @DeleteMapping("/assets/{id}") public Map<String, Object> deleteAsset(@PathVariable long id) throws IOException {
        Asset asset = repository.findAsset(id).orElseThrow(() -> new ContentRepository.NotFound("Image not found"));
        if (asset.referenceCount() > 0) throw new ContentRepository.Conflict("This image is still in use");
        assets.deleteFile(asset);
        repository.deleteAsset(id);
        return Map.of("deleted", id);
    }

    @PostMapping("/import")
    public MarkdownImportService.ImportResult importMarkdown(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "paths", required = false) List<String> paths,
            @RequestParam(value = "categoryId", required = false) Long categoryId) throws IOException {
        return importer.importBundle(file, images, paths, categoryId);
    }

    private static void validateCategory(CategoryInput input) {
        if (input.name() == null || input.name().isBlank()) throw new IllegalArgumentException("Folder name is required");
        if (input.slug() == null || !input.slug().matches("[a-z0-9][a-z0-9-]{0,62}"))
            throw new IllegalArgumentException("Folder slug must use lowercase letters, numbers and hyphens");
    }

    private static void validatePost(PostInput input, boolean creating) {
        if (creating && (input.slug() == null || !input.slug().matches("[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}")))
            throw new IllegalArgumentException("Invalid article slug");
        if (input.title() != null && input.title().isBlank()) throw new IllegalArgumentException("Title cannot be empty");
        if (creating && (input.title() == null || input.content() == null)) throw new IllegalArgumentException("Title and Markdown are required");
        if (input.status() != null && !List.of("draft", "published", "archived").contains(input.status()))
            throw new IllegalArgumentException("Invalid article status");
    }

    private record LoginWindow(int attempts, Instant expiresAt) {}
}
