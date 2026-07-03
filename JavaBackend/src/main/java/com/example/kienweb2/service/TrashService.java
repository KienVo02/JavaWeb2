package com.example.kienweb2.service;

import com.example.kienweb2.dto.TrashItemResponse;
import java.util.List;

public interface TrashService {

    List<TrashItemResponse> getTrashItems();

    void restore(String type, Long id);

    void deletePermanently(String type, Long id);
}
