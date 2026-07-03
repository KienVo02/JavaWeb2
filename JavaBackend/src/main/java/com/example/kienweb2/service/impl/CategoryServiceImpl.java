package com.example.kienweb2.service.impl;

import com.example.kienweb2.dto.CategoryRequest;
import com.example.kienweb2.dto.CategoryResponse;
import com.example.kienweb2.entity.Category;
import com.example.kienweb2.entity.Product;
import com.example.kienweb2.exception.BadRequestException;
import com.example.kienweb2.exception.ResourceNotFoundException;
import com.example.kienweb2.repository.CategoryRepository;
import com.example.kienweb2.repository.ProductRepository;
import com.example.kienweb2.service.CategoryService;
import com.example.kienweb2.service.SlugService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final SlugService slugService;

    public CategoryServiceImpl(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            SlugService slugService
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.slugService = slugService;
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findNotDeletedOrderByCreatedAtDesc("DELETED")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        return toResponse(findCategory(id));
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (!hasText(request.getName())) {
            throw new BadRequestException("Ten danh muc khong duoc de trong.");
        }

        Category category = new Category();
        category.setName(request.getName().trim());
        category.setSlug(buildUniqueSlug(resolveSlug(request.getSlug(), request.getName()), null));
        category.setImageUrl(trimToNull(request.getImageUrl()));
        category.setDescription(trimToNull(request.getDescription()));
        category.setStatus(resolveStatus(request.getStatus()));

        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategory(id);

        boolean nameChanged = false;
        if (hasText(request.getName())) {
            String nextName = request.getName().trim();
            nameChanged = !nextName.equals(category.getName());
            category.setName(nextName);
        }

        if (hasText(request.getSlug())) {
            category.setSlug(buildUniqueSlug(slugService.slugify(request.getSlug()), id));
        } else if (nameChanged) {
            category.setSlug(buildUniqueSlug(slugService.slugify(category.getName()), id));
        }

        if (request.getImageUrl() != null) {
            category.setImageUrl(trimToNull(request.getImageUrl()));
        }
        if (request.getDescription() != null) {
            category.setDescription(trimToNull(request.getDescription()));
        }
        if (hasText(request.getStatus())) {
            category.setStatus(request.getStatus().trim());
        }

        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = findCategory(id);
        category.setStatus("DELETED");
        categoryRepository.save(category);
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay danh muc id: " + id));
    }

    private String buildUniqueSlug(String baseSlug, Long currentId) {
        String slug = baseSlug;
        int index = 2;

        while (categoryRepository.findBySlug(slug)
                .filter(category -> currentId == null || !category.getId().equals(currentId))
                .isPresent()) {
            slug = baseSlug + "-" + index;
            index++;
        }

        return slug;
    }

    private String resolveSlug(String slug, String name) {
        return hasText(slug) ? slugService.slugify(slug) : slugService.slugify(name);
    }

    private String resolveStatus(String status) {
        return hasText(status) ? status.trim() : "ACTIVE";
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String trimToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }

    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setImageUrl(category.getImageUrl());
        response.setDescription(category.getDescription());
        response.setStatus(category.getStatus());
        response.setCreatedAt(category.getCreatedAt());
        return response;
    }
}
