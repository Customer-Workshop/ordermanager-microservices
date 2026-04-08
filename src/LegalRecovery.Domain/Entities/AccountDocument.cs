using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Represents a document generated or ordered for an account.
/// </summary>
public class AccountDocument : BaseEntity
{
    public Guid AccountId { get; set; }
    public Account Account { get; set; } = null!;
    public Guid? TemplateId { get; set; }
    public DocumentTemplate? Template { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public DocumentFormat Format { get; set; }
    public string? BlobStoragePath { get; set; }
    public bool IsRedacted { get; set; }
    public DateTime? RedactedAt { get; set; }
    public string? VendorOrderId { get; set; }
    public string? VendorName { get; set; }
    public string Status { get; set; } = "Pending";
}
