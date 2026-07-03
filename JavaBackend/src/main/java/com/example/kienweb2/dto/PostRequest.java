package com.example.kienweb2.dto;

public record PostRequest(String title, String slug, String imageUrl, String content, String status) {
}
