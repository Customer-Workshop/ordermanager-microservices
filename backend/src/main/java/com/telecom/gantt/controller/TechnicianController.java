package com.telecom.gantt.controller;

import com.telecom.gantt.model.Technician;
import com.telecom.gantt.repository.MarketRepository;
import com.telecom.gantt.repository.TechnicianRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/technicians")
public class TechnicianController {

    private final TechnicianRepository technicianRepository;
    private final MarketRepository marketRepository;

    public TechnicianController(TechnicianRepository technicianRepository, MarketRepository marketRepository) {
        this.technicianRepository = technicianRepository;
        this.marketRepository = marketRepository;
    }

    @GetMapping
    public List<Technician> getAll(@RequestParam(required = false) Long marketId) {
        if (marketId != null) {
            return technicianRepository.findByMarketId(marketId);
        }
        return technicianRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Technician> getById(@PathVariable Long id) {
        return technicianRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Technician> create(@RequestBody Map<String, Object> payload) {
        Long marketId = Long.valueOf(payload.get("marketId").toString());
        return marketRepository.findById(marketId).map(market -> {
            Technician tech = new Technician();
            tech.setTechId(payload.get("techId").toString());
            tech.setName(payload.get("name").toString());
            tech.setEmail(payload.get("email").toString());
            tech.setAddress(payload.get("address").toString());
            tech.setSkills(payload.get("skills").toString());
            tech.setMarket(market);
            return ResponseEntity.ok(technicianRepository.save(tech));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Technician> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return technicianRepository.findById(id).map(existing -> {
            if (payload.containsKey("name")) existing.setName(payload.get("name").toString());
            if (payload.containsKey("email")) existing.setEmail(payload.get("email").toString());
            if (payload.containsKey("address")) existing.setAddress(payload.get("address").toString());
            if (payload.containsKey("skills")) existing.setSkills(payload.get("skills").toString());
            return ResponseEntity.ok(technicianRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (technicianRepository.existsById(id)) {
            technicianRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
