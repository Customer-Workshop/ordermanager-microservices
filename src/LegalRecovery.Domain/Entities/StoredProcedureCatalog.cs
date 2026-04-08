using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Catalog of stored procedures and functions from the 3 TB legacy database.
/// Each proc is tagged with its process stage, I/O tables, and calling frequency.
/// Jurisdiction-specific branches are documented separately.
/// </summary>
public class StoredProcedureCatalog : BaseEntity
{
    public string ProcedureName { get; set; } = string.Empty;
    public string SchemaName { get; set; } = string.Empty;
    public string ProcedureType { get; set; } = string.Empty; // StoredProcedure, Function, Trigger
    public ProcessStage? MappedStage { get; set; }
    public string? InputParameters { get; set; }
    public string? OutputParameters { get; set; }
    public string? InputTables { get; set; }
    public string? OutputTables { get; set; }
    public string? DecisionTreeDescription { get; set; }
    public bool HasJurisdictionBranching { get; set; }
    public int CallingFrequencyPerDay { get; set; }
    public DateTime? LastExecutionDate { get; set; }
    public string? CallingBatchJobs { get; set; }
    public string? NewPlatformComponent { get; set; }
    public bool IsMigrated { get; set; }
}
