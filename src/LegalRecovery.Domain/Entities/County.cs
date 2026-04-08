namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Represents a county within a state. Mid-level of the jurisdiction hierarchy.
/// Inherits rules from State unless overridden.
/// </summary>
public class County : BaseEntity
{
    public string FipsCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid StateId { get; set; }
    public State State { get; set; } = null!;
    public int? StatuteOfLimitationsMonthsOverride { get; set; }
    public decimal? MinimumBalanceOverride { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Courthouse> Courthouses { get; set; } = new List<Courthouse>();
    public ICollection<JurisdictionRule> Rules { get; set; } = new List<JurisdictionRule>();
}
