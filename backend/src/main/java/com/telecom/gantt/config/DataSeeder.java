package com.telecom.gantt.config;

import com.telecom.gantt.model.*;
import com.telecom.gantt.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final TerritoryRepository territoryRepository;
    private final MarketRepository marketRepository;
    private final TechnicianRepository technicianRepository;
    private final JobRepository jobRepository;
    private final AssignmentRepository assignmentRepository;

    public DataSeeder(TerritoryRepository territoryRepository, MarketRepository marketRepository,
                      TechnicianRepository technicianRepository, JobRepository jobRepository,
                      AssignmentRepository assignmentRepository) {
        this.territoryRepository = territoryRepository;
        this.marketRepository = marketRepository;
        this.technicianRepository = technicianRepository;
        this.jobRepository = jobRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Override
    public void run(String... args) {
        if (territoryRepository.count() > 0) return;

        // Territories
        Territory ohio = territoryRepository.save(new Territory("Ohio", "OH"));
        Territory texas = territoryRepository.save(new Territory("Texas", "TX"));
        Territory california = territoryRepository.save(new Territory("California", "CA"));

        // Markets for Ohio
        Market columbus = marketRepository.save(new Market("Columbus", "COL", ohio));
        Market cleveland = marketRepository.save(new Market("Cleveland", "CLE", ohio));
        Market cincinnati = marketRepository.save(new Market("Cincinnati", "CIN", ohio));

        // Markets for Texas
        Market dallas = marketRepository.save(new Market("Dallas", "DAL", texas));
        Market houston = marketRepository.save(new Market("Houston", "HOU", texas));

        // Markets for California
        Market losAngeles = marketRepository.save(new Market("Los Angeles", "LA", california));
        Market sanFrancisco = marketRepository.save(new Market("San Francisco", "SF", california));

        // Technicians - Columbus
        Technician t1 = createTechnician("TECH-001", "John Smith", "john.smith@telecom.com",
                "123 Main St, Columbus, OH 43215", "copper,fiber,modem", columbus);
        Technician t2 = createTechnician("TECH-002", "Sarah Johnson", "sarah.johnson@telecom.com",
                "456 Oak Ave, Columbus, OH 43220", "fiber,router,networking", columbus);
        Technician t3 = createTechnician("TECH-003", "Mike Davis", "mike.davis@telecom.com",
                "789 Elm Rd, Columbus, OH 43201", "copper,modem,router", columbus);

        // Technicians - Cleveland
        Technician t4 = createTechnician("TECH-004", "Emily Brown", "emily.brown@telecom.com",
                "321 Pine St, Cleveland, OH 44101", "fiber,networking", cleveland);
        Technician t5 = createTechnician("TECH-005", "David Wilson", "david.wilson@telecom.com",
                "654 Cedar Ln, Cleveland, OH 44102", "copper,fiber,modem,router", cleveland);

        // Technicians - Cincinnati
        Technician t6 = createTechnician("TECH-006", "Lisa Anderson", "lisa.anderson@telecom.com",
                "987 Maple Dr, Cincinnati, OH 45201", "fiber,router,networking", cincinnati);

        // Technicians - Dallas
        Technician t7 = createTechnician("TECH-007", "James Taylor", "james.taylor@telecom.com",
                "111 Peach St, Dallas, TX 75201", "copper,fiber,modem", dallas);
        Technician t8 = createTechnician("TECH-008", "Amanda Martinez", "amanda.martinez@telecom.com",
                "222 Birch Ave, Dallas, TX 75202", "fiber,router,networking", dallas);

        // Jobs - Columbus
        Job j1 = createJob("JOB-1001", "FIBER", "Fiber installation - residential", "100 High St, Columbus, OH 43215", 90, columbus);
        Job j2 = createJob("JOB-1002", "COPPER", "Copper line repair", "200 Broad St, Columbus, OH 43215", 60, columbus);
        Job j3 = createJob("JOB-1003", "MODEM", "Modem setup and configuration", "300 State St, Columbus, OH 43215", 45, columbus);
        Job j4 = createJob("JOB-1004", "ROUTER", "Router installation - business", "400 Front St, Columbus, OH 43215", 60, columbus);
        Job j5 = createJob("JOB-1005", "FIBER", "Fiber upgrade - residential", "500 Third St, Columbus, OH 43220", 75, columbus);
        Job j6 = createJob("JOB-1006", "NETWORKING", "Network troubleshooting", "600 Fourth St, Columbus, OH 43220", 90, columbus);
        Job j7 = createJob("JOB-1007", "COPPER", "Copper line installation", "700 Fifth St, Columbus, OH 43201", 60, columbus);
        Job j8 = createJob("JOB-1008", "MODEM", "Modem replacement", "800 Sixth St, Columbus, OH 43201", 30, columbus);

        // Jobs - Cleveland
        Job j9 = createJob("JOB-2001", "FIBER", "Fiber installation - business", "100 Euclid Ave, Cleveland, OH 44101", 120, cleveland);
        Job j10 = createJob("JOB-2002", "ROUTER", "Router upgrade", "200 Superior Ave, Cleveland, OH 44101", 45, cleveland);
        Job j11 = createJob("JOB-2003", "NETWORKING", "Network setup - office", "300 Prospect Ave, Cleveland, OH 44102", 90, cleveland);
        Job j12 = createJob("JOB-2004", "COPPER", "Copper repair - emergency", "400 Carnegie Ave, Cleveland, OH 44102", 60, cleveland);

        // Jobs - Cincinnati
        Job j13 = createJob("JOB-3001", "FIBER", "Fiber installation", "100 Vine St, Cincinnati, OH 45201", 90, cincinnati);
        Job j14 = createJob("JOB-3002", "ROUTER", "Router config - business", "200 Main St, Cincinnati, OH 45201", 60, cincinnati);

        // Jobs - Dallas
        Job j15 = createJob("JOB-4001", "FIBER", "Fiber installation", "100 Commerce St, Dallas, TX 75201", 90, dallas);
        Job j16 = createJob("JOB-4002", "MODEM", "Modem setup", "200 Elm St, Dallas, TX 75201", 45, dallas);

        // Use today's date for assignments
        LocalDate today = LocalDate.now();

        // John Smith (TECH-001) - Columbus - Full day schedule
        createAssignment(t1, null, today, time(today, 7, 0), time(today, 7, 30), 30, "COMPLETED", "TRAVEL", "Travel from home to first job");
        createAssignment(t1, j1, today, time(today, 7, 30), time(today, 9, 0), 0, "COMPLETED", "JOB", null);
        createAssignment(t1, null, today, time(today, 9, 0), time(today, 9, 20), 20, "COMPLETED", "TRAVEL", "Travel to next job");
        createAssignment(t1, j2, today, time(today, 9, 20), time(today, 10, 20), 0, "IN_PROGRESS", "JOB", null);
        createAssignment(t1, null, today, time(today, 10, 20), time(today, 10, 35), 15, "SCHEDULED", "TRAVEL", "Travel to next job");
        createAssignment(t1, j3, today, time(today, 10, 35), time(today, 11, 20), 0, "SCHEDULED", "JOB", null);
        createAssignment(t1, null, today, time(today, 11, 20), time(today, 12, 0), 0, "SCHEDULED", "BREAK", "Lunch break");
        createAssignment(t1, null, today, time(today, 12, 0), time(today, 12, 15), 15, "SCHEDULED", "TRAVEL", "Travel to afternoon job");
        createAssignment(t1, j8, today, time(today, 12, 15), time(today, 12, 45), 0, "SCHEDULED", "JOB", null);
        createAssignment(t1, null, today, time(today, 12, 45), time(today, 13, 15), 30, "SCHEDULED", "RETURN_HOME", "Return home");

        // Sarah Johnson (TECH-002) - Columbus
        createAssignment(t2, null, today, time(today, 7, 30), time(today, 8, 0), 30, "COMPLETED", "TRAVEL", "Travel from home");
        createAssignment(t2, j5, today, time(today, 8, 0), time(today, 9, 15), 0, "COMPLETED", "JOB", null);
        createAssignment(t2, null, today, time(today, 9, 15), time(today, 9, 30), 15, "SCHEDULED", "TRAVEL", "Travel to next job");
        createAssignment(t2, j6, today, time(today, 9, 30), time(today, 11, 0), 0, "SCHEDULED", "JOB", null);
        createAssignment(t2, null, today, time(today, 11, 0), time(today, 11, 30), 0, "SCHEDULED", "BREAK", "Lunch break");
        createAssignment(t2, null, today, time(today, 11, 30), time(today, 11, 50), 20, "SCHEDULED", "TRAVEL", "Travel to afternoon job");
        createAssignment(t2, j4, today, time(today, 11, 50), time(today, 12, 50), 0, "SCHEDULED", "JOB", null);
        createAssignment(t2, null, today, time(today, 12, 50), time(today, 13, 20), 30, "SCHEDULED", "RETURN_HOME", "Return home");

        // Mike Davis (TECH-003) - Columbus
        createAssignment(t3, null, today, time(today, 8, 0), time(today, 8, 25), 25, "COMPLETED", "TRAVEL", "Travel from home");
        createAssignment(t3, j7, today, time(today, 8, 25), time(today, 9, 25), 0, "IN_PROGRESS", "JOB", null);
        createAssignment(t3, null, today, time(today, 9, 25), time(today, 9, 45), 20, "SCHEDULED", "TRAVEL", "Travel to next job");
        createAssignment(t3, j2, today, time(today, 9, 45), time(today, 10, 45), 0, "SCHEDULED", "JOB", "Copper line inspection");
        createAssignment(t3, null, today, time(today, 10, 45), time(today, 11, 15), 0, "SCHEDULED", "BREAK", "Lunch break");
        createAssignment(t3, null, today, time(today, 11, 15), time(today, 11, 45), 30, "SCHEDULED", "RETURN_HOME", "Return home");

        // Emily Brown (TECH-004) - Cleveland
        createAssignment(t4, null, today, time(today, 7, 0), time(today, 7, 35), 35, "COMPLETED", "TRAVEL", "Travel from home");
        createAssignment(t4, j9, today, time(today, 7, 35), time(today, 9, 35), 0, "IN_PROGRESS", "JOB", null);
        createAssignment(t4, null, today, time(today, 9, 35), time(today, 9, 50), 15, "SCHEDULED", "TRAVEL", "Travel to next job");
        createAssignment(t4, j11, today, time(today, 9, 50), time(today, 11, 20), 0, "SCHEDULED", "JOB", null);
        createAssignment(t4, null, today, time(today, 11, 20), time(today, 12, 0), 0, "SCHEDULED", "BREAK", "Lunch break");
        createAssignment(t4, null, today, time(today, 12, 0), time(today, 12, 35), 35, "SCHEDULED", "RETURN_HOME", "Return home");

        // David Wilson (TECH-005) - Cleveland
        createAssignment(t5, null, today, time(today, 7, 30), time(today, 8, 0), 30, "COMPLETED", "TRAVEL", "Travel from home");
        createAssignment(t5, j10, today, time(today, 8, 0), time(today, 8, 45), 0, "COMPLETED", "JOB", null);
        createAssignment(t5, null, today, time(today, 8, 45), time(today, 9, 5), 20, "SCHEDULED", "TRAVEL", "Travel to next job");
        createAssignment(t5, j12, today, time(today, 9, 5), time(today, 10, 5), 0, "SCHEDULED", "JOB", null);
        createAssignment(t5, null, today, time(today, 10, 5), time(today, 10, 35), 0, "SCHEDULED", "BREAK", "Lunch break");
        createAssignment(t5, null, today, time(today, 10, 35), time(today, 11, 5), 30, "SCHEDULED", "RETURN_HOME", "Return home");

        // Lisa Anderson (TECH-006) - Cincinnati
        createAssignment(t6, null, today, time(today, 7, 0), time(today, 7, 20), 20, "COMPLETED", "TRAVEL", "Travel from home");
        createAssignment(t6, j13, today, time(today, 7, 20), time(today, 8, 50), 0, "IN_PROGRESS", "JOB", null);
        createAssignment(t6, null, today, time(today, 8, 50), time(today, 9, 10), 20, "SCHEDULED", "TRAVEL", "Travel to next job");
        createAssignment(t6, j14, today, time(today, 9, 10), time(today, 10, 10), 0, "SCHEDULED", "JOB", null);
        createAssignment(t6, null, today, time(today, 10, 10), time(today, 10, 40), 0, "SCHEDULED", "BREAK", "Lunch break");
        createAssignment(t6, null, today, time(today, 10, 40), time(today, 11, 0), 20, "SCHEDULED", "RETURN_HOME", "Return home");

        // James Taylor (TECH-007) - Dallas
        createAssignment(t7, null, today, time(today, 7, 0), time(today, 7, 40), 40, "COMPLETED", "TRAVEL", "Travel from home");
        createAssignment(t7, j15, today, time(today, 7, 40), time(today, 9, 10), 0, "IN_PROGRESS", "JOB", null);
        createAssignment(t7, null, today, time(today, 9, 10), time(today, 9, 30), 20, "SCHEDULED", "TRAVEL", "Travel to next job");
        createAssignment(t7, j16, today, time(today, 9, 30), time(today, 10, 15), 0, "SCHEDULED", "JOB", null);
        createAssignment(t7, null, today, time(today, 10, 15), time(today, 10, 55), 40, "SCHEDULED", "RETURN_HOME", "Return home");

        System.out.println("Seed data loaded successfully!");
    }

    private Technician createTechnician(String techId, String name, String email, String address, String skills, Market market) {
        Technician t = new Technician();
        t.setTechId(techId);
        t.setName(name);
        t.setEmail(email);
        t.setAddress(address);
        t.setSkills(skills);
        t.setMarket(market);
        return technicianRepository.save(t);
    }

    private Job createJob(String jobId, String type, String description, String address, int duration, Market market) {
        Job j = new Job();
        j.setJobId(jobId);
        j.setType(type);
        j.setDescription(description);
        j.setAddress(address);
        j.setEstimatedDurationMinutes(duration);
        j.setStatus("OPEN");
        j.setMarket(market);
        return jobRepository.save(j);
    }

    private Assignment createAssignment(Technician tech, Job job, LocalDate date,
                                         LocalDateTime start, LocalDateTime end,
                                         int travelMins, String status, String taskType, String notes) {
        Assignment a = new Assignment();
        a.setTechnician(tech);
        a.setJob(job);
        a.setAssignmentDate(date);
        a.setStartTime(start);
        a.setEndTime(end);
        a.setTravelTimeMinutes(travelMins);
        a.setStatus(status);
        a.setTaskType(taskType);
        a.setNotes(notes);
        return assignmentRepository.save(a);
    }

    private LocalDateTime time(LocalDate date, int hour, int minute) {
        return LocalDateTime.of(date, LocalTime.of(hour, minute));
    }
}
