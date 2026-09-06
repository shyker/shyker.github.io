package com.shyler.blog.content;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Files;
import java.nio.file.Path;

import static com.shyler.blog.content.ContentModels.PostInput;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ContentApiIntegrationTest {
    private static final Path ROOT;
    static {
        try { ROOT = Files.createTempDirectory("shyler-content-test-"); }
        catch (Exception e) { throw new ExceptionInInitializerError(e); }
    }

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> "jdbc:sqlite:" + ROOT.resolve("blog.db"));
        registry.add("app.content.media-dir", () -> ROOT.resolve("media").toString());
        registry.add("app.content.seed-dir", () -> ROOT.resolve("missing").toString());
    }

    @Autowired ContentRepository repository;
    @Autowired MockMvc mvc;

    @Test
    void draftsArePrivateAndPublishedPostsBecomePublic() throws Exception {
        var folder = repository.findCategoryBySlug("others", false).orElseThrow();
        String slug = "visibility-test";
        repository.findPost(slug, false).ifPresent(post -> repository.deletePost(slug));
        var draft = repository.savePost(new PostInput(slug, "Visibility", "", "# Visibility", folder.id(), null,
                "draft", false, null), 0);

        mvc.perform(get("/api/public/posts/{slug}", slug)).andExpect(status().isNotFound());

        repository.savePost(new PostInput(slug, draft.title(), draft.summary(), draft.content(), folder.id(), null,
                "published", false, draft.version()), 0);
        mvc.perform(get("/api/public/posts/{slug}", slug)).andExpect(status().isOk());
    }
}
