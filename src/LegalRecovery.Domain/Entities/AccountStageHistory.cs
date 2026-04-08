using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Tracks the history of an account moving through process stages.
/// Used for auditing and data warehouse event-driven pipelines.
/// </summary>
public class AccountStageHistory : BaseEntity
{
    public Guid AccountId { get; set; }
    public Account Account { get; set; } = null!;
    public ProcessStage FromStage { get; set; }
    public ProcessStage ToStage { get; set; }
    public DateTime TransitionDate { get; set; } = DateTime.UtcNow;
    public string? Reason { get; set; }
    public string? PerformedBy { get; set; }
}
