namespace LegalRecovery.Domain.Events;

public class DocumentOrderedEvent : DomainEvent
{
    public Guid AccountId { get; init; }
    public Guid DocumentId { get; init; }
    public Guid? TemplateId { get; init; }
    public string VendorName { get; init; } = string.Empty;
    public string OrderMethod { get; init; } = string.Empty; // API or SFTP
}
