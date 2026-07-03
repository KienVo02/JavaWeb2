package com.example.kienweb2.service;

import com.example.kienweb2.dto.PostRequest;
import com.example.kienweb2.entity.Post;
import java.util.List;

public interface PostService {

    List<Post> getAllPosts();

    Post getPostById(Long id);

    Post createPost(PostRequest request);

    Post updatePost(Long id, PostRequest request);

    void deletePost(Long id);
}
