using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Entities;

/// <summary>
/// A configurable rule applied at any level of the jurisdiction hierarchy.
/// Rules at lower levels override rules at higher levels (courthouse > county > state).
/// This enables the configurable rules engine where all configurations can be done without deployment.
/// </summary>
public class JurisdictionRule : BaseEntity
{
    public string RuleKey { get; set; } = string.Empty;
    public string RuleValue { get; set; } = string.Empty;
    public string? Description { get; set; }
    public JurisdictionLevel Level { get; set; }
    public ProcessStage? ApplicableStage { get; set; }

    public Guid? StateId { get; set; }
    public State? State { get; set; }

    public Guid? CountyId { get; set; }
    public County? County { get; set; }

    public Guid? CourthouseId { get; set; }
    public Courthouse? Courthouse { get; set; }

    public DateTime EffectiveDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpirationDate { get; set; }
    public bool IsOverride { get; set; }
    public bool IsActive { get; set; } = true;
}
