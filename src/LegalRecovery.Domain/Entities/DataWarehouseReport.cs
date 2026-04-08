namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Catalog of existing Power BI reports and their data sources.
/// Used to ensure no reporting capability is lost during migration.
/// </summary>
public class DataWarehouseReport : BaseEntity
{
    public string ReportName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AudienceRole { get; set; } = string.Empty;
    public string RefreshFrequency { get; set; } = string.Empty;
    public int DataFreshnessMinutes { get; set; }
    public string? SourceTablesViews { get; set; }
    public string? SourceStoredProcedures { get; set; }
    public string? PowerBiWorkspaceId { get; set; }
    public string? PowerBiReportId { get; set; }
    public bool IsMigrated { get; set; }
    public DateTime? MigrationDate { get; set; }
    public string? NewDataSource { get; set; }
}
