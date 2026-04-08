using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Represents one of the 44,000 document templates.
/// Tagged by jurisdiction, product type, and document type with versioning and lifecycle management.
/// </summary>
public class DocumentTemplate : BaseEntity
{
    public string TemplateCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public string ProductType { get; set; } = string.Empty;
    public DocumentFormat Format { get; set; }
    public int VersionNumber { get; set; } = 1;
    public TemplateStatus Status { get; set; } = TemplateStatus.Active;

    public Guid? StateId { get; set; }
    public State? State { get; set; }
    public Guid? CountyId { get; set; }
    public County? County { get; set; }
    public Guid? CourthouseId { get; set; }
    public Courthouse? Courthouse { get; set; }

    public DateTime EffectiveDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public DateTime? LastUsedDate { get; set; }
    public int UsageCount { get; set; }
    public string? BlobStoragePath { get; set; }
    public string? ContentHash { get; set; }
    public double? SimilarityScore { get; set; }
    public Guid? SimilarToTemplateId { get; set; }
}
