using LegalRecovery.Domain.Events;

namespace LegalRecovery.Domain.Interfaces;

public interface IEventPublisher
{
    Task PublishAsync<T>(T domainEvent, CancellationToken cancellationToken = default) where T : DomainEvent;
    Task PublishBatchAsync<T>(IEnumerable<T> domainEvents, CancellationToken cancellationToken = default) where T : DomainEvent;
}
