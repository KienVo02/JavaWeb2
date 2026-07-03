package com.example.kienweb2.controller;

import com.example.kienweb2.dto.ImageUploadResponse;
import com.example.kienweb2.exception.BadRequestException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/uploads")
public class UploadController {

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    private static final Pattern NON_ASCII = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Pattern SAFE_FILE_PART = Pattern.compile("[^a-z0-9._-]+");
    private static final Set<String> ALLOWED_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp",
            "image/gif"
    );

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageUploadResponse> uploadImage(@RequestPart("file") MultipartFile file) {
        validateImage(file);

        String safeName = buildSafeFileName(file.getOriginalFilename());
        String dateFolder = LocalDate.now().toString();
        Path uploadDir = Path.of(System.getProperty("user.dir")).getParent().resolve("image").resolve("uploads").resolve(dateFolder);

        try {
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(safeName).normalize();
            if (!target.startsWith(uploadDir)) {
                throw new BadRequestException("Ten file khong hop le.");
            }
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new BadRequestException("Khong the luu anh tai len.");
        }

        String imageUrl = "/image/uploads/" + dateFolder + "/" + safeName;
        return ResponseEntity.ok(new ImageUploadResponse(imageUrl, safeName));
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui long chon anh can tai len.");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new BadRequestException("Anh tai len khong duoc vuot qua 5MB.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new BadRequestException("Chi ho tro anh JPG, PNG, WEBP hoac GIF.");
        }
    }

    private String buildSafeFileName(String originalName) {
        String name = originalName == null || originalName.isBlank() ? "image" : originalName;
        int dotIndex = name.lastIndexOf('.');
        String extension = dotIndex >= 0 ? name.substring(dotIndex).toLowerCase(Locale.ROOT) : ".png";
        String baseName = dotIndex >= 0 ? name.substring(0, dotIndex) : name;
        String ascii = Normalizer.normalize(baseName, Normalizer.Form.NFD);
        String safeBase = SAFE_FILE_PART.matcher(NON_ASCII.matcher(ascii).replaceAll("").toLowerCase(Locale.ROOT)).replaceAll("-");
        safeBase = safeBase.replaceAll("^-+|-+$", "");
        if (safeBase.isBlank()) {
            safeBase = "image";
        }
        return safeBase + "-" + UUID.randomUUID() + extension;
    }
}
