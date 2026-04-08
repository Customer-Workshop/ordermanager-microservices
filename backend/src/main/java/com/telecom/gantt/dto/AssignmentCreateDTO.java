package com.telecom.gantt.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AssignmentCreateDTO {
    private Long technicianId;
    private Long jobId;
    private LocalDate assignmentDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer travelTimeMinutes;
    private String status;
    private String taskType;
    private String notes;

    public AssignmentCreateDTO() {}

    public Long getTechnicianId() { return technicianId; }
    public void setTechnicianId(Long technicianId) { this.technicianId = technicianId; }

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
