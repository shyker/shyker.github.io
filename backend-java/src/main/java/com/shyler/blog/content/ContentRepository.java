package com.shyler.blog.content;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static com.shyler.blog.content.ContentModels.*;

@Repository
public class ContentRepository {
    private final JdbcTemplate jdbc;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    public ContentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @PostConstruct
    void initialize() throws Exception {
        if (datasourceUrl.startsWith("jdbc:sqlite:") && !datasourceUrl.contains(":memory:")) {
            Path db = Path.of(datasourceUrl.substring("jdbc:sqlite:".length())).toAbsolutePath().normalize();
            if (db.getParent() != null) Files.createDirectories(db.getParent());
        }
        jdbc.execute("PRAGMA foreign_keys = ON");
        jdbc.execute("PRAGMA journal_mode = WAL");
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS assets (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  storage_key TEXT NOT NULL UNIQUE,
                  original_name TEXT NOT NULL,
                  mime_type TEXT NOT NULL,
                  size_bytes INTEGER NOT NULL,
                  sha256 TEXT NOT NULL UNIQUE,
                  url TEXT NOT NULL,
                  created_at TEXT NOT NULL
                )
                """);
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS categories (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  slug TEXT NOT NULL UNIQUE,
                  name TEXT NOT NULL,
                  description TEXT NOT NULL DEFAULT '',
                  cover_asset_id INTEGER,
                  sort_order INTEGER NOT NULL DEFAULT 0,
                  visible INTEGER NOT NULL DEFAULT 1,
                  created_at TEXT NOT NULL,
                  updated_at TEXT NOT NULL,
                  FOREIGN KEY(cover_asset_id) REFERENCES assets(id) ON DELETE RESTRICT
                )
                """);
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS posts (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  slug TEXT NOT NULL UNIQUE,
                  title TEXT NOT NULL,
                  summary TEXT NOT NULL DEFAULT '',
                  content TEXT NOT NULL,
                  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
                  category_id INTEGER,
                  public_path TEXT,
                  allow_missing_images INTEGER NOT NULL DEFAULT 0,
                  unresolved_image_count INTEGER NOT NULL DEFAULT 0,
                  version INTEGER NOT NULL DEFAULT 1,
                  published_at TEXT,
                  created_at TEXT NOT NULL,
                  updated_at TEXT NOT NULL,
                  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE RESTRICT
                )
                """);
        jdbc.execute("""
                CREATE TABLE IF NOT EXISTS post_assets (
                  post_id INTEGER NOT NULL,
                  asset_id INTEGER NOT NULL,
                  PRIMARY KEY(post_id, asset_id),
                  FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
                  FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE RESTRICT
                )
                """);
        jdbc.execute("CREATE INDEX IF NOT EXISTS idx_posts_status_category ON posts(status, category_id)");
    }

    public List<Category> listCategories(boolean publicOnly) {
        String publishedJoin = publicOnly ? " AND p.status='published'" : "";
        String where = publicOnly ? "WHERE c.visible=1" : "";
        return jdbc.query("""
                SELECT c.*, a.url AS cover_url,
                  (SELECT COUNT(*) FROM posts p WHERE p.category_id=c.id%s) AS post_count
                FROM categories c LEFT JOIN assets a ON a.id=c.cover_asset_id
                %s ORDER BY c.sort_order, c.name
                """.formatted(publishedJoin, where), (rs, row) -> new Category(
                rs.getLong("id"), rs.getString("slug"), rs.getString("name"), rs.getString("description"),
                nullableLong(rs.getObject("cover_asset_id")), rs.getString("cover_url"), rs.getInt("sort_order"),
                rs.getBoolean("visible"), rs.getInt("post_count"), instant(rs.getString("created_at")), instant(rs.getString("updated_at"))
        ));
    }

    public Optional<Category> findCategoryBySlug(String slug, boolean publicOnly) {
        return listCategories(publicOnly).stream().filter(c -> c.slug().equals(slug)).findFirst();
    }

    public Optional<Category> findCategory(long id) {
        return listCategories(false).stream().filter(c -> c.id() == id).findFirst();
    }

    @Transactional
    public Category createCategory(CategoryInput input) {
        String now = Instant.now().toString();
        jdbc.update("""
                INSERT INTO categories(slug,name,description,cover_asset_id,sort_order,visible,created_at,updated_at)
                VALUES(?,?,?,?,?,?,?,?)
                """, input.slug(), input.name(), value(input.description()), input.coverAssetId(),
                input.sortOrder() == null ? 0 : input.sortOrder(), bool(input.visible(), true), now, now);
        return findCategoryBySlug(input.slug(), false).orElseThrow();
    }

    @Transactional
    public Category updateCategory(long id, CategoryInput input) {
        Category old = findCategory(id).orElseThrow(() -> new NotFound("Category not found"));
        jdbc.update("""
                UPDATE categories SET slug=?,name=?,description=?,cover_asset_id=?,sort_order=?,visible=?,updated_at=? WHERE id=?
                """,
                pick(input.slug(), old.slug()), pick(input.name(), old.name()),
                input.description() == null ? old.description() : input.description(),
                input.coverAssetId(), input.sortOrder() == null ? old.sortOrder() : input.sortOrder(),
                input.visible() == null ? old.visible() : input.visible(), Instant.now().toString(), id);
        return findCategory(id).orElseThrow();
    }

    public void deleteCategory(long id) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM posts WHERE category_id=?", Integer.class, id);
        if (count != null && count > 0) throw new Conflict("Move the posts before deleting this folder");
        if (jdbc.update("DELETE FROM categories WHERE id=?", id) == 0) throw new NotFound("Category not found");
    }

    public List<Post> listPosts(String categorySlug, boolean publicOnly) {
        StringBuilder sql = new StringBuilder("""
                SELECT p.*, c.slug category_slug, c.name category_name FROM posts p
                LEFT JOIN categories c ON c.id=p.category_id WHERE 1=1
                """);
        var args = new java.util.ArrayList<Object>();
        if (publicOnly) sql.append(" AND p.status='published'");
        if (categorySlug != null && !categorySlug.isBlank()) {
            sql.append(" AND c.slug=?"); args.add(categorySlug);
        }
        sql.append(" ORDER BY COALESCE(p.published_at,p.updated_at) DESC, p.title");
        return jdbc.query(sql.toString(), postMapper(), args.toArray());
    }

    public Optional<Post> findPost(String slug, boolean publicOnly) {
        String sql = """
                SELECT p.*, c.slug category_slug, c.name category_name FROM posts p
                LEFT JOIN categories c ON c.id=p.category_id WHERE p.slug=?
                """ + (publicOnly ? " AND p.status='published'" : "");
        return jdbc.query(sql, postMapper(), slug).stream().findFirst();
    }

    @Transactional
    public Post savePost(PostInput input, int unresolvedCount) {
        validateStatus(input.status(), unresolvedCount, input.allowMissingImages());
        Optional<Post> existing = input.slug() == null ? Optional.empty() : findPost(input.slug(), false);
        String now = Instant.now().toString();
        if (existing.isEmpty()) {
            jdbc.update("""
                    INSERT INTO posts(slug,title,summary,content,status,category_id,public_path,allow_missing_images,
                      unresolved_image_count,version,published_at,created_at,updated_at)
                    VALUES(?,?,?,?,?,?,?,?,?,1,?,?,?)
                    """, input.slug(), input.title(), value(input.summary()), value(input.content()), status(input.status()),
                    input.categoryId(), blankToNull(input.publicPath()), bool(input.allowMissingImages(), false), unresolvedCount,
                    "published".equals(status(input.status())) ? now : null, now, now);
        } else {
            Post old = existing.get();
            if (input.version() != null && input.version() != old.version()) throw new Conflict("This article changed in another session");
            String nextStatus = input.status() == null ? old.status() : input.status();
            validateStatus(nextStatus, unresolvedCount, input.allowMissingImages() == null ? old.allowMissingImages() : input.allowMissingImages());
            String publishedAt = "published".equals(nextStatus)
                    ? (old.publishedAt() == null ? now : old.publishedAt().toString()) : null;
            jdbc.update("""
                    UPDATE posts SET title=?,summary=?,content=?,status=?,category_id=?,public_path=?,allow_missing_images=?,
                      unresolved_image_count=?,version=version+1,published_at=?,updated_at=? WHERE slug=?
                    """, pick(input.title(), old.title()), input.summary() == null ? old.summary() : input.summary(),
                    input.content() == null ? old.content() : input.content(), nextStatus,
                    input.categoryId() == null ? old.categoryId() : input.categoryId(),
                    input.publicPath() == null ? old.publicPath() : blankToNull(input.publicPath()),
                    input.allowMissingImages() == null ? old.allowMissingImages() : input.allowMissingImages(),
                    unresolvedCount, publishedAt, now, old.slug());
        }
        Post saved = findPost(input.slug(), false).orElseThrow();
        refreshPostAssetLinks(saved.id(), saved.content());
        return findPost(input.slug(), false).orElseThrow();
    }

    public void deletePost(String slug) {
        if (jdbc.update("DELETE FROM posts WHERE slug=?", slug) == 0) throw new NotFound("Post not found");
    }

    public List<Asset> listAssets() {
        return jdbc.query("""
                SELECT a.*,
                  ((SELECT COUNT(*) FROM post_assets pa WHERE pa.asset_id=a.id) +
                   (SELECT COUNT(*) FROM categories c WHERE c.cover_asset_id=a.id)) reference_count
                FROM assets a ORDER BY a.created_at DESC
                """, (rs, row) -> new Asset(
                rs.getLong("id"), rs.getString("storage_key"), rs.getString("original_name"), rs.getString("mime_type"),
                rs.getLong("size_bytes"), rs.getString("sha256"), rs.getString("url"), rs.getInt("reference_count"),
                instant(rs.getString("created_at"))
        ));
    }

    public Optional<Asset> findAssetByHash(String hash) {
        return listAssets().stream().filter(a -> a.sha256().equals(hash)).findFirst();
    }

    public Optional<Asset> findAsset(long id) {
        return listAssets().stream().filter(a -> a.id() == id).findFirst();
    }

    public Asset addAsset(String key, String name, String mime, long size, String hash, String url) {
        try {
            jdbc.update("INSERT INTO assets(storage_key,original_name,mime_type,size_bytes,sha256,url,created_at) VALUES(?,?,?,?,?,?,?)",
                    key, name, mime, size, hash, url, Instant.now().toString());
        } catch (DuplicateKeyException ignored) {}
        return findAssetByHash(hash).orElseThrow();
    }

    public void deleteAsset(long id) {
        Asset asset = findAsset(id).orElseThrow(() -> new NotFound("Asset not found"));
        if (asset.referenceCount() > 0) throw new Conflict("This image is still in use");
        jdbc.update("DELETE FROM assets WHERE id=?", id);
    }

    private void refreshPostAssetLinks(long postId, String content) {
        jdbc.update("DELETE FROM post_assets WHERE post_id=?", postId);
        for (Asset asset : listAssets()) {
            if (content.contains(asset.url())) {
                jdbc.update("INSERT OR IGNORE INTO post_assets(post_id,asset_id) VALUES(?,?)", postId, asset.id());
            }
        }
    }

    private org.springframework.jdbc.core.RowMapper<Post> postMapper() {
        return (rs, row) -> new Post(
                rs.getLong("id"), rs.getString("slug"), rs.getString("title"), rs.getString("summary"), rs.getString("content"),
                rs.getString("status"), nullableLong(rs.getObject("category_id")), rs.getString("category_slug"), rs.getString("category_name"),
                rs.getString("public_path"), rs.getBoolean("allow_missing_images"), rs.getInt("unresolved_image_count"),
                rs.getLong("version"), instant(rs.getString("published_at")), instant(rs.getString("created_at")), instant(rs.getString("updated_at"))
        );
    }

    private static void validateStatus(String status, int unresolved, Boolean allowMissing) {
        if ("published".equals(status(status)) && unresolved > 0 && !Boolean.TRUE.equals(allowMissing)) {
            throw new Conflict("Resolve or explicitly ignore local image references before publishing");
        }
    }

    private static String status(String value) { return value == null || value.isBlank() ? "draft" : value; }
    private static String value(String value) { return value == null ? "" : value; }
    private static String pick(String value, String fallback) { return value == null || value.isBlank() ? fallback : value; }
    private static String blankToNull(String value) { return value == null || value.isBlank() ? null : value; }
    private static int bool(Boolean value, boolean fallback) { return (value == null ? fallback : value) ? 1 : 0; }
    private static Long nullableLong(Object value) { return value == null ? null : ((Number) value).longValue(); }
    private static Instant instant(String value) { return value == null ? null : Instant.parse(value); }

    public static class NotFound extends RuntimeException { public NotFound(String message) { super(message); } }
    public static class Conflict extends RuntimeException { public Conflict(String message) { super(message); } }
}
