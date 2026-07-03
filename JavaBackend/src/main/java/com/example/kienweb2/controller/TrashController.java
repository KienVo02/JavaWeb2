package com.example.kienweb2.controller;

import com.example.kienweb2.dto.TrashItemResponse;
import com.example.kienweb2.service.TrashService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/trash")
public class TrashController {

    private final TrashService trashService;

    public TrashController(TrashService trashService) {
        this.trashService = trashService;
    }

    @GetMapping
    public ResponseEntity<List<TrashItemResponse>> getTrashItems() {
        return ResponseEntity.ok(trashService.getTrashItems());
    }

    @PutMapping("/{type}/{id}/restore")
    public ResponseEntity<Void> restore(@PathVariable String type, @PathVariable Long id) {
        trashService.restore(type, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{type}/{id}/permanent")
    public ResponseEntity<Void> deletePermanently(@PathVariable String type, @PathVariable Long id) {
        trashService.deletePermanently(type, id);
        return ResponseEntity.noContent().build();
    }
}
