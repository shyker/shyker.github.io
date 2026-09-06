# Shyler Blog API

Spring Boot service for the existing diary API and the new real-time blog CMS.

## Local development

1. Copy the settings from the repository `.env.example` into your shell or IDE environment.
2. For local-only work the defaults are usable: the admin password is `change-me`, SQLite is written to `backend-java/data/blog.db`, and media to `backend-java/data/media`.
3. Run `mvn spring-boot:run` from this directory.
4. Build the frontend with `NEXT_PUBLIC_CONTENT_API_URL=http://localhost:8081` and run `npm run dev` from the repository root.

The development password fallback is deliberately disabled as soon as `ADMIN_PASSWORD_HASH` is supplied. Generate a BCrypt hash before exposing the service publicly.

## Content lifecycle

- The first startup creates the SQLite schema and imports any missing known Markdown files from `BLOG_SEED_DIR`. Existing database posts are never overwritten.
- Public endpoints only return posts in `published` state.
- Admin imports always create drafts. Local image references must be resolved or explicitly ignored before publication.
- Uploaded images are content-addressed by SHA-256. Deleting a post never deletes media automatically.

## Production

- Persist the SQLite file and media directory outside the application checkout.
- Configure a trusted HTTPS domain with `deploy/nginx-blog.conf.example` and run the jar with the supplied systemd example.
- Back up the SQLite database and media directory together. With SQLite WAL enabled, use `sqlite3 /var/lib/shyler-blog/blog.db ".backup '/backup/blog.db'"` before archiving the media directory.
- Build GitHub Pages with `NEXT_PUBLIC_CONTENT_API_URL` set to the final HTTPS API origin.
