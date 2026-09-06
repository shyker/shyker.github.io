package com.shyler.blog.content;

import java.time.Instant;

public final class ContentModels {
    private ContentModels() {}

    public record Category(
            long id, String slug, String name, String description,
            Long coverAssetId, String coverUrl, int sortOrder,
            boolean visible, int postCount, Instant createdAt, Instant updatedAt
    ) {}

    public record Post(
            long id, String slug, String title, String summary, String content,
            String status, Long categoryId, String categorySlug, String categoryName,
            String publicPath, boolean allowMissingImages, int unresolvedImageCount,
            long version, Instant publishedAt, Instant createdAt, Instant updatedAt
    ) {}

    public record Asset(
            long id, String storageKey, String originalName, String mimeType,
            long sizeBytes, String sha256, String url, int referenceCount, Instant createdAt
    ) {}

    public record CategoryInput(
            String slug, String name, String description, Long coverAssetId,
            Integer sortOrder, Boolean visible
    ) {}

    public record PostInput(
            String slug, String title, String summary, String content,
            Long categoryId, String publicPath, String status,
            Boolean allowMissingImages, Long version
    ) {}
}
