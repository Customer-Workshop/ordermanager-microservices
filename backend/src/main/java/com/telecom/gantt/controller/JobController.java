package com.telecom.gantt.controller;

import com.telecom.gantt.model.Job;
import com.telecom.gantt.repository.JobRepository;
import com.telecom.gantt.repository.MarketRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobRepository jobRepository;
    private final MarketRepository marketRepository;

    public JobController(JobRepository jobRepository, MarketRepository marketRepository) {
        this.jobRepository = jobRepository;
        this.marketRepository = marketRepository;
    }

    @GetMapping
    public List<Job> getAll(@RequestParam(required = false) Long marketId) {
        if (marketId != null) {
            return jobRepository.findByMarketId(marketId);
        }
        return jobRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getById(@PathVariable Long id) {
        return jobRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Job> create(@RequestBody Map<String, Object> payload) {
        Long marketId = Long.valueOf(payload.get("marketId").toString());
        return marketRepository.findById(marketId).map(market -> {
            Job job = new Job();
            job.setJobId(payload.get("jobId").toString());
            job.setType(payload.get("type").toString());
            job.setDescription(payload.get("description").toString());
            job.setAddress(payload.get("address").toString());
            job.setEstimatedDurationMinutes(Integer.valueOf(payload.get("estimatedDurationMinutes").toString()));
            job.setStatus(payload.getOrDefault("status", "OPEN").toString());
            job.setMarket(market);
            return ResponseEntity.ok(jobRepository.save(job));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return jobRepository.findById(id).map(existing -> {
            if (payload.containsKey("type")) existing.setType(payload.get("type").toString());
            if (payload.containsKey("description")) existing.setDescription(payload.get("description").toString());
            if (payload.containsKey("address")) existing.setAddress(payload.get("address").toString());
            if (payload.containsKey("estimatedDurationMinutes"))
                existing.setEstimatedDurationMinutes(Integer.valueOf(payload.get("estimatedDurationMinutes").toString()));
            if (payload.containsKey("status")) existing.setStatus(payload.get("status").toString());
            return ResponseEntity.ok(jobRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (jobRepository.existsById(id)) {
            jobRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
