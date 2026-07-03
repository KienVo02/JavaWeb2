package com.example.kienweb2.dto;

import java.time.LocalDateTime;

public class TrashItemResponse {

    private String type;
    private String typeLabel;
    private Long id;
    private String name;
    private String detail;
    private String status;
    private LocalDateTime createdAt;

    public TrashItemResponse() {
    }

    public TrashItemResponse(String type, String typeLabel, Long id, String name, String detail, String status, LocalDateTime createdAt) {
        this.type = type;
        this.typeLabel = typeLabel;
        this.id = id;
        this.name = name;
        this.detail = detail;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTypeLabel() {
        return typeLabel;
    }

    public void setTypeLabel(String typeLabel) {
        this.typeLabel = typeLabel;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
