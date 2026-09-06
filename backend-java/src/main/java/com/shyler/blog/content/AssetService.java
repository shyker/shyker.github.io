package com.shyler.blog.content;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.HexFormat;

import static com.shyler.blog.content.ContentModels.Asset;

@Service
public class AssetService {
    public static final long MAX_IMAGE_BYTES = 15L * 1024 * 1024;

    private final ContentRepository repository;

    @Value("${app.content.media-dir}")
    private String mediaDir;

    @Value("${app.content.media-base-url}")
    private String mediaBaseUrl;

    public AssetService(ContentRepository repository) {
        this.repository = repository;
    }

    public Asset store(MultipartFile file) throws IOException {
        return store(file.getOriginalFilename(), file.getBytes());
    }

    public Asset store(String originalName, byte[] bytes) throws IOException {
        if (bytes.length == 0) throw new IllegalArgumentException("Empty image");
        if (bytes.length > MAX_IMAGE_BYTES) throw new IllegalArgumentException("Image exceeds 15 MB");

        ImageType type = detect(bytes);
        String hash;
        try {
            hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (java.security.NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 is unavailable", impossible);
        }
        var existing = repository.findAssetByHash(hash);
        if (existing.isPresent()) return existing.get();

        String key = hash + type.extension;
        Path root = Path.of(mediaDir).toAbsolutePath().normalize();
        Files.createDirectories(root);
        Path target = root.resolve(key).normalize();
        if (!target.startsWith(root)) throw new IllegalArgumentException("Invalid media path");
        Files.write(target, bytes);

        String base = mediaBaseUrl.replaceAll("/+$", "");
        return repository.addAsset(key, safeName(originalName), type.mime, bytes.length, hash, base + "/" + key);
    }

    public void deleteFile(ContentModels.Asset asset) throws IOException {
        Path root = Path.of(mediaDir).toAbsolutePath().normalize();
        Path file = root.resolve(asset.storageKey()).normalize();
        if (file.startsWith(root)) Files.deleteIfExists(file);
    }

    private static String safeName(String name) {
        if (name == null || name.isBlank()) return "image";
        return name.replace('\\', '/').replaceAll("^.*/", "").replaceAll("[\\r\\n]", "_");
    }

    private static ImageType detect(byte[] b) {
        if (b.length >= 8 && b[0] == (byte) 0x89 && b[1] == 0x50 && b[2] == 0x4e && b[3] == 0x47)
            return new ImageType("image/png", ".png");
        if (b.length >= 3 && b[0] == (byte) 0xff && b[1] == (byte) 0xd8 && b[2] == (byte) 0xff)
            return new ImageType("image/jpeg", ".jpg");
        if (b.length >= 6 && new String(b, 0, 6, java.nio.charset.StandardCharsets.US_ASCII).startsWith("GIF8"))
            return new ImageType("image/gif", ".gif");
        if (b.length >= 12 && new String(b, 0, 4, java.nio.charset.StandardCharsets.US_ASCII).equals("RIFF")
                && new String(b, 8, 4, java.nio.charset.StandardCharsets.US_ASCII).equals("WEBP"))
            return new ImageType("image/webp", ".webp");
        throw new IllegalArgumentException("Only PNG, JPEG, WebP and GIF images are allowed");
    }

    private record ImageType(String mime, String extension) {}
}
