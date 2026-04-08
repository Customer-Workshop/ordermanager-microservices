using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Events;

public class BatchJobMigratedEvent : DomainEvent
{
    public Guid BatchJobId { get; init; }
    public string JobName { get; init; } = string.Empty;
    public BatchJobStatus NewStatus { get; init; }
    public string? NewEventTopic { get; init; }
}
