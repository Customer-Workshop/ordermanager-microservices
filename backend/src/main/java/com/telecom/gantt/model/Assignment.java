package com.telecom.gantt.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "technician_id", nullable = false)
    @JsonIgnoreProperties({"market", "hibernateLazyInitializer", "handler"})
    private Technician technician;

    @Column(name = "technician_id", insertable = false, updatable = false)
    private Long technicianId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id")
    @JsonIgnoreProperties({"market", "hibernateLazyInitializer", "handler"})
    private Job job;

    @Column(name = "job_id", insertable = false, updatable = false)
    private Long jobId;

    @Column(name = "assignment_date", nullable = false)
    private LocalDate assignmentDate;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "travel_time_minutes")
    private Integer travelTimeMinutes;

    @Column(nullable = false)
    private String status;

    @Column(name = "task_type", nullable = false)
    private String taskType;

    private String notes;

    public Assignment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Technician getTechnician() { return technician; }
    public void setTechnician(Technician technician) { this.technician = technician; }

    public Long getTechnicianId() { return technicianId; }
    public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public LocalDate getAssignmentDate() { return assignmentDate; }
    public void setAssignmentDate(LocalDate assignmentDate) { this.assignmentDate = assignmentDate; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Integer getTravelTimeMinutes() { return travelTimeMinutes; }
    public void setTravelTimeMinutes(Integer travelTimeMinutes) { this.travelTimeMinutes = travelTimeMinutes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTaskType() { return taskType; }
    public void setTaskType(String taskType) { this.taskType = taskType; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
