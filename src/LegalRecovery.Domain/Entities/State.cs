namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Represents a US state in the jurisdiction hierarchy.
/// Top level of the State > County > Courthouse hierarchy.
/// </summary>
public class State : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int StatuteOfLimitationsMonths { get; set; }
    public decimal DefaultMinimumBalance { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<County> Counties { get; set; } = new List<County>();
    public ICollection<JurisdictionRule> Rules { get; set; } = new List<JurisdictionRule>();
}
