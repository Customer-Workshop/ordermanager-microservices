using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Records each execution of an integration (SFTP or API).
/// Used for reconciliation between SFTP and API modes during migration.
/// </summary>
public class IntegrationExecution : BaseEntity
{
    public Guid PartnerId { get; set; }
    public IntegrationPartner Partner { get; set; } = null!;
    public IntegrationProtocol ProtocolUsed { get; set; }
    public DateTime ExecutionStartTime { get; set; }
    public DateTime? ExecutionEndTime { get; set; }
    public int RecordsProcessed { get; set; }
    public int RecordsFailed { get; set; }
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ReconciliationId { get; set; }
    public bool HasDiscrepancies { get; set; }
}
