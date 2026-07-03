package com.example.kienweb2.service.impl;

import com.example.kienweb2.dto.PostRequest;
import com.example.kienweb2.entity.Post;
import com.example.kienweb2.exception.BadRequestException;
import com.example.kienweb2.exception.ResourceNotFoundException;
import com.example.kienweb2.repository.PostRepository;
import com.example.kienweb2.service.PostService;
import com.example.kienweb2.service.SlugService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final SlugService slugService;

    public PostServiceImpl(PostRepository postRepository, SlugService slugService) {
        this.postRepository = postRepository;
        this.slugService = slugService;
    }

    @Override
    public List<Post> getAllPosts() {
        return postRepository.findNotDeletedOrderByCreatedAtDesc("DELETED");
    }

    @Override
    public Post getPostById(Long id) {
        return findPost(id);
    }

    @Override
    @Transactional
    public Post createPost(PostRequest request) {
        if (!hasText(request.title())) {
            throw new BadRequestException("Tieu de bai viet khong duoc de trong.");
        }

        Post post = new Post();
        post.setTitle(request.title().trim());
        post.setSlug(buildUniqueSlug(resolveSlug(request.slug(), request.title()), null));
        applyData(post, request);
        return postRepository.save(post);
    }

    @Override
    @Transactional
    public Post updatePost(Long id, PostRequest request) {
        Post post = findPost(id);
        boolean titleChanged = false;

        if (hasText(request.title())) {
            String nextTitle = request.title().trim();
            titleChanged = !nextTitle.equals(post.getTitle());
            post.setTitle(nextTitle);
        }

        if (hasText(request.slug())) {
            post.setSlug(buildUniqueSlug(slugService.slugify(request.slug()), id));
        } else if (titleChanged) {
            post.setSlug(buildUniqueSlug(slugService.slugify(post.getTitle()), id));
        }

        applyData(post, request);
        return postRepository.save(post);
    }

    @Override
    @Transactional
    public void deletePost(Long id) {
        Post post = findPost(id);
        post.setStatus("DELETED");
        postRepository.save(post);
    }

    private void applyData(Post post, PostRequest request) {
        if (request.imageUrl() != null) {
            post.setImageUrl(trimToNull(request.imageUrl()));
        }
        if (request.content() != null) {
            post.setContent(trimToNull(request.content()));
        }
        if (hasText(request.status())) {
            post.setStatus(request.status().trim());
        }
    }

    private Post findPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay bai viet id: " + id));
    }

    private String buildUniqueSlug(String baseSlug, Long currentId) {
        String slug = baseSlug;
        int index = 2;

        while (postRepository.findBySlug(slug)
                .filter(post -> currentId == null || !post.getId().equals(currentId))
                .isPresent()) {
            slug = baseSlug + "-" + index;
            index++;
        }

        return slug;
    }

    private String resolveSlug(String slug, String title) {
        return hasText(slug) ? slugService.slugify(slug) : slugService.slugify(title);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String trimToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }
}
