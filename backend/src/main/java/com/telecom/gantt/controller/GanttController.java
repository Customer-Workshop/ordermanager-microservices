package com.telecom.gantt.controller;

import com.telecom.gantt.dto.GanttResponseDTO;
import com.telecom.gantt.service.GanttService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/gantt")
public class GanttController {

    private final GanttService ganttService;

    public GanttController(GanttService ganttService) {
        this.ganttService = ganttService;
    }

    @GetMapping
    public GanttResponseDTO getGanttData(
            @RequestParam(required = false) Long territoryId,
            @RequestParam(required = false) List<Long> marketIds,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ganttService.getGanttData(territoryId, marketIds, date);
    }
}
