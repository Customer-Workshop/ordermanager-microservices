package com.telecom.gantt.dto;

import java.util.List;

public class GanttResponseDTO {
    private List<GanttTaskDTO> data;

    public GanttResponseDTO() {}

    public GanttResponseDTO(List<GanttTaskDTO> data) {
        this.data = data;
    }

    public List<GanttTaskDTO> getData() { return data; }
    public void setData(List<GanttTaskDTO> data) { this.data = data; }
}
