using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Represents one of the 20-30 external integration partners.
/// Tracks current protocol (SFTP/API), data format, frequency, and SLA.
/// Supports dual-mode operation during SFTP-to-API migration.
/// </summary>
public class IntegrationPartner : BaseEntity
{
    public string PartnerName { get; set; } = string.Empty;
    public IntegrationDirection Direction { get; set; }
    public IntegrationProtocol CurrentProtocol { get; set; }
    public IntegrationProtocol? TargetProtocol { get; set; }
    public bool IsDualModeEnabled { get; set; }
    public string DataFormat { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public int EstimatedDailyVolume { get; set; }
    public int SlaMinutes { get; set; }
    public bool PartnerOffersApi { get; set; }
    public int MigrationPriority { get; set; }
    public string? ApiEndpointUrl { get; set; }
    public string? SftpHost { get; set; }
    public string? SftpPath { get; set; }
    public int? PollingIntervalMinutes { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<IntegrationExecution> Executions { get; set; } = new List<IntegrationExecution>();
}
