package com.telecom.gantt.controller;

import com.telecom.gantt.model.Territory;
import com.telecom.gantt.repository.TerritoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/territories")
public class TerritoryController {

    private final TerritoryRepository territoryRepository;

    public TerritoryController(TerritoryRepository territoryRepository) {
        this.territoryRepository = territoryRepository;
    }

    @GetMapping
    public List<Territory> getAll() {
        return territoryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Territory> getById(@PathVariable Long id) {
        return territoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Territory create(@RequestBody Territory territory) {
        return territoryRepository.save(territory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Territory> update(@PathVariable Long id, @RequestBody Territory territory) {
        return territoryRepository.findById(id).map(existing -> {
            existing.setName(territory.getName());
            existing.setCode(territory.getCode());
            return ResponseEntity.ok(territoryRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (territoryRepository.existsById(id)) {
            territoryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
