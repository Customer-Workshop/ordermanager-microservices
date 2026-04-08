using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Events;

/// <summary>
/// Published when an account transitions between process stages.
/// Consumed by the data warehouse pipeline for near-real-time reporting.
/// </summary>
public class AccountStageTransitionEvent : DomainEvent
{
    public Guid AccountId { get; init; }
    public string AccountNumber { get; init; } = string.Empty;
    public ProcessStage FromStage { get; init; }
    public ProcessStage ToStage { get; init; }
    public Guid? CourthouseId { get; init; }
    public string? Reason { get; init; }
}
