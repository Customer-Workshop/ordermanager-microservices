package com.telecom.gantt.service;

import com.telecom.gantt.dto.GanttResponseDTO;
import com.telecom.gantt.dto.GanttTaskDTO;
import com.telecom.gantt.model.Assignment;
import com.telecom.gantt.model.Technician;
import com.telecom.gantt.repository.AssignmentRepository;
import com.telecom.gantt.repository.TechnicianRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GanttService {

    private final AssignmentRepository assignmentRepository;
    private final TechnicianRepository technicianRepository;

    public GanttService(AssignmentRepository assignmentRepository, TechnicianRepository technicianRepository) {
        this.assignmentRepository = assignmentRepository;
        this.technicianRepository = technicianRepository;
    }

    public GanttResponseDTO getGanttData(Long territoryId, List<Long> marketIds, LocalDate date) {
        List<Assignment> assignments;
        List<Technician> technicians;

        if (marketIds != null && !marketIds.isEmpty()) {
            assignments = assignmentRepository.findByMarketIdsAndDate(marketIds, date);
            technicians = new ArrayList<>();
            for (Long marketId : marketIds) {
                technicians.addAll(technicianRepository.findByMarketId(marketId));
            }
        } else if (territoryId != null) {
            assignments = assignmentRepository.findByTerritoryAndDate(territoryId, date);
            technicians = technicianRepository.findByMarketTerritoryId(territoryId);
        } else {
            assignments = assignmentRepository.findByAssignmentDate(date);
            technicians = new ArrayList<>();
        }

        List<GanttTaskDTO> tasks = new ArrayList<>();

        Map<Long, List<Assignment>> assignmentsByTechnician = assignments.stream()
                .collect(Collectors.groupingBy(a -> a.getTechnician().getId()));

        long techRowId = -1;
        for (Technician tech : technicians) {
            GanttTaskDTO techRow = new GanttTaskDTO();
            techRow.setId(techRowId);
            techRow.setText(tech.getName() + " (" + tech.getTechId() + ")");
            techRow.setTechnicianId(tech.getId());
            techRow.setTaskType("TECHNICIAN");
            tasks.add(techRow);

            List<Assignment> techAssignments = assignmentsByTechnician.getOrDefault(tech.getId(), Collections.emptyList());
            for (Assignment assignment : techAssignments) {
                GanttTaskDTO task = new GanttTaskDTO();
                task.setId(assignment.getId());
                task.setStartDate(assignment.getStartTime());
                task.setEndDate(assignment.getEndTime());
                task.setTechnicianId(tech.getId());
                task.setStatus(assignment.getStatus());
                task.setTaskType(assignment.getTaskType());
                task.setTravelTimeMinutes(assignment.getTravelTimeMinutes());
                task.setNotes(assignment.getNotes());
                task.setParent(techRowId);

                if (assignment.getJob() != null) {
                    task.setJobId(assignment.getJob().getId());
                    task.setJobType(assignment.getJob().getType());
                    task.setText(assignment.getJob().getJobId() + " - " + assignment.getJob().getType());
                    task.setColor(getColorForTaskType(assignment.getTaskType(), assignment.getJob().getType()));
                } else {
                    task.setText(assignment.getTaskType());
                    task.setColor(getColorForTaskType(assignment.getTaskType(), null));
                }

                tasks.add(task);
            }

            techRowId--;
        }

        return new GanttResponseDTO(tasks);
    }

    private String getColorForTaskType(String taskType, String jobType) {
        if ("TRAVEL".equals(taskType)) return "#95a5a6";
        if ("BREAK".equals(taskType)) return "#f39c12";
        if ("RETURN_HOME".equals(taskType)) return "#95a5a6";
        if (jobType != null) {
            switch (jobType.toUpperCase()) {
                case "COPPER": return "#3498db";
                case "FIBER": return "#2ecc71";
                case "MODEM": return "#9b59b6";
                case "ROUTER": return "#e74c3c";
                case "NETWORKING": return "#1abc9c";
                default: return "#3498db";
            }
        }
        return "#3498db";
    }
}
