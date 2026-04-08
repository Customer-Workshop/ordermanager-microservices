namespace LegalRecovery.Domain.Events;

public class SuitFiledEvent : DomainEvent
{
    public Guid AccountId { get; init; }
    public Guid CourthouseId { get; init; }
    public Guid FilingId { get; init; }
    public bool IsEFiled { get; init; }
    public string? CaseNumber { get; init; }
}
