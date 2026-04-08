package com.telecom.gantt.controller;

import com.telecom.gantt.model.Market;
import com.telecom.gantt.model.Territory;
import com.telecom.gantt.repository.MarketRepository;
import com.telecom.gantt.repository.TerritoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/markets")
public class MarketController {

    private final MarketRepository marketRepository;
    private final TerritoryRepository territoryRepository;

    public MarketController(MarketRepository marketRepository, TerritoryRepository territoryRepository) {
        this.marketRepository = marketRepository;
        this.territoryRepository = territoryRepository;
    }

    @GetMapping
    public List<Market> getAll(@RequestParam(required = false) Long territoryId) {
        if (territoryId != null) {
            return marketRepository.findByTerritoryId(territoryId);
        }
        return marketRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Market> getById(@PathVariable Long id) {
        return marketRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Market> create(@RequestBody Map<String, Object> payload) {
        Long territoryId = Long.valueOf(payload.get("territoryId").toString());
        return territoryRepository.findById(territoryId).map(territory -> {
            Market market = new Market();
            market.setName(payload.get("name").toString());
            market.setCode(payload.get("code").toString());
            market.setTerritory(territory);
            return ResponseEntity.ok(marketRepository.save(market));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Market> update(@PathVariable Long id, @RequestBody Market market) {
        return marketRepository.findById(id).map(existing -> {
            existing.setName(market.getName());
            existing.setCode(market.getCode());
            return ResponseEntity.ok(marketRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (marketRepository.existsById(id)) {
            marketRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
