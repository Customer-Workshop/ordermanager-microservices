using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Events;

public class IntegrationExecutedEvent : DomainEvent
{
    public Guid PartnerId { get; init; }
    public string PartnerName { get; init; } = string.Empty;
    public IntegrationProtocol ProtocolUsed { get; init; }
    public int RecordsProcessed { get; init; }
    public bool IsSuccess { get; init; }
    public bool HasDiscrepancies { get; init; }
}
