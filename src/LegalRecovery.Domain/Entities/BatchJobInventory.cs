using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Inventory of the ~2,100 legacy batch jobs.
/// Tracks migration status from batch to event-driven processing.
/// Since FoxPro source is unavailable, behavior is captured via I/O observation.
/// </summary>
public class BatchJobInventory : BaseEntity
{
    public string JobName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProcessStage? MappedStage { get; set; }
    public bool IsCrossCutting { get; set; }
    public BatchJobStatus MigrationStatus { get; set; } = BatchJobStatus.Active;

    public string TriggerType { get; set; } = string.Empty; // Schedule, Event, Manual
    public string? CronSchedule { get; set; }
    public string? InputTables { get; set; }
    public string? OutputTables { get; set; }
    public string? InputFiles { get; set; }
    public string? OutputFiles { get; set; }
    public string? DownstreamDependencies { get; set; }
    public DateTime? LastExecutionDate { get; set; }
    public int ExecutionFrequencyPerDay { get; set; }
    public bool IsObsolete { get; set; }
    public string? RetirementJustification { get; set; }

    public string? NewEventTopic { get; set; }
    public string? NewServiceName { get; set; }
    public DateTime? MigrationDate { get; set; }
    public DateTime? ParallelRunStartDate { get; set; }
    public DateTime? DecommissionDate { get; set; }
}
