package com.telecom.gantt.controller;

import com.telecom.gantt.dto.AssignmentCreateDTO;
import com.telecom.gantt.dto.AssignmentUpdateDTO;
import com.telecom.gantt.model.Assignment;
import com.telecom.gantt.repository.AssignmentRepository;
import com.telecom.gantt.repository.JobRepository;
import com.telecom.gantt.repository.TechnicianRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;
    private final TechnicianRepository technicianRepository;
    private final JobRepository jobRepository;

    public AssignmentController(AssignmentRepository assignmentRepository,
                                TechnicianRepository technicianRepository,
                                JobRepository jobRepository) {
        this.assignmentRepository = assignmentRepository;
        this.technicianRepository = technicianRepository;
        this.jobRepository = jobRepository;
    }

    @GetMapping
    public List<Assignment> getAll(
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (technicianId != null && date != null) {
            return assignmentRepository.findByTechnicianIdAndAssignmentDate(technicianId, date);
        }
        if (date != null) {
            return assignmentRepository.findByAssignmentDate(date);
        }
        return assignmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getById(@PathVariable Long id) {
        return assignmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Assignment> create(@RequestBody AssignmentCreateDTO dto) {
        Assignment assignment = new Assignment();
        assignment.setAssignmentDate(dto.getAssignmentDate());
        assignment.setStartTime(dto.getStartTime());
        assignment.setEndTime(dto.getEndTime());
        assignment.setTravelTimeMinutes(dto.getTravelTimeMinutes());
        assignment.setStatus(dto.getStatus() != null ? dto.getStatus() : "SCHEDULED");
        assignment.setTaskType(dto.getTaskType() != null ? dto.getTaskType() : "JOB");
        assignment.setNotes(dto.getNotes());

        return technicianRepository.findById(dto.getTechnicianId()).map(tech -> {
            assignment.setTechnician(tech);
            if (dto.getJobId() != null) {
                jobRepository.findById(dto.getJobId()).ifPresent(assignment::setJob);
            }
            return ResponseEntity.ok(assignmentRepository.save(assignment));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Assignment> update(@PathVariable Long id, @RequestBody AssignmentUpdateDTO dto) {
        return assignmentRepository.findById(id).map(existing -> {
            if (dto.getStartTime() != null) existing.setStartTime(dto.getStartTime());
            if (dto.getEndTime() != null) existing.setEndTime(dto.getEndTime());
            if (dto.getStatus() != null) existing.setStatus(dto.getStatus());
            if (dto.getNotes() != null) existing.setNotes(dto.getNotes());
            return ResponseEntity.ok(assignmentRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (assignmentRepository.existsById(id)) {
            assignmentRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
