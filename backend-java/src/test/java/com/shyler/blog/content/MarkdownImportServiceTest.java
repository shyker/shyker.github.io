package com.shyler.blog.content;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MarkdownImportServiceTest {
    @Test
    void identifiesOnlyUnresolvedLocalImageReferences() {
        String markdown = """
                ![relative](./images/a.png)
                ![windows](C:\\notes\\b.jpg)
                ![remote](https://cdn.example.com/c.webp)
                ![media](/media/hash.png)
                ![legacy](/posts/redis1/old.png)
                """;

        assertThat(MarkdownImportService.unresolvedLocalReferences(markdown))
                .containsExactlyInAnyOrder("./images/a.png", "C:\\notes\\b.jpg");
    }

    @Test
    void extractsUsefulFallbackMetadata() {
        String markdown = "# A title\n\nThis is the first paragraph.\n\n## Notes";
        assertThat(MarkdownImportService.extractTitle(markdown, "fallback")).isEqualTo("A title");
        assertThat(MarkdownImportService.extractSummary(markdown)).isEqualTo("This is the first paragraph.");
    }
}
