package com.example.kienweb2.config;

import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ImageResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path workingDir = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
        Path imagePath = workingDir.resolve("image");
        if (!Files.isDirectory(imagePath) && workingDir.getParent() != null) {
            imagePath = workingDir.getParent().resolve("image");
        }
        String imageLocation = imagePath.toUri().toString();
        if (!imageLocation.endsWith("/")) {
            imageLocation += "/";
        }

        registry.addResourceHandler("/image/**")
                .addResourceLocations(imageLocation);
    }
}
