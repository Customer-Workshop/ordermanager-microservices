package com.telecom.gantt.dto;

import java.time.LocalDateTime;

public class AssignmentUpdateDTO {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String notes;

    public AssignmentUpdateDTO() {}

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
