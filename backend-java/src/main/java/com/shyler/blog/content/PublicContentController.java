package com.shyler.blog.content;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.util.HexFormat;

@RestController
@RequestMapping("/api/public")
public class PublicContentController {
    private final ContentRepository repository;
    private final ObjectMapper mapper;

    public PublicContentController(ContentRepository repository, ObjectMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @GetMapping("/categories")
    public ResponseEntity<?> categories(@RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch) {
        return response(repository.listCategories(true), ifNoneMatch);
    }

    @GetMapping("/posts")
    public ResponseEntity<?> posts(@RequestParam(required = false) String category,
                                   @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch) {
        if (category != null && repository.findCategoryBySlug(category, true).isEmpty()) {
            throw new ContentRepository.NotFound("Folder not found");
        }
        return response(repository.listPosts(category, true), ifNoneMatch);
    }

    @GetMapping("/posts/{slug}")
    public ResponseEntity<?> post(@PathVariable String slug,
                                  @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch) {
        return response(repository.findPost(slug, true)
                .orElseThrow(() -> new ContentRepository.NotFound("Article not found")), ifNoneMatch);
    }

    private ResponseEntity<?> response(Object body, String ifNoneMatch) {
        try {
            String etag = "\"" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(mapper.writeValueAsBytes(body))).substring(0, 24) + "\"";
            if (etag.equals(ifNoneMatch)) return ResponseEntity.status(304).eTag(etag).cacheControl(CacheControl.noCache()).build();
            return ResponseEntity.ok().eTag(etag).cacheControl(CacheControl.noCache()).body(body);
        } catch (Exception e) {
            return ResponseEntity.ok().cacheControl(CacheControl.noCache()).body(body);
        }
    }
}
