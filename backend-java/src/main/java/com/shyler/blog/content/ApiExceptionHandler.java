package com.shyler.blog.content;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ContentRepository.NotFound.class)
    ResponseEntity<?> notFound(RuntimeException e) { return ResponseEntity.status(404).body(Map.of("error", e.getMessage())); }

    @ExceptionHandler(ContentRepository.Conflict.class)
    ResponseEntity<?> conflict(RuntimeException e) { return ResponseEntity.status(409).body(Map.of("error", e.getMessage())); }

    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class})
    ResponseEntity<?> badRequest(Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<?> integrity(DataIntegrityViolationException e) {
        return ResponseEntity.status(409).body(Map.of("error", "That slug is already in use, or the selected image/folder is invalid"));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<?> tooLarge(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(413).body(Map.of("error", "Upload exceeds the configured size limit"));
    }
}
