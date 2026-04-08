using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Represents a courthouse within a county. Lowest level of the jurisdiction hierarchy.
/// There are 9,000+ courthouses across the US.
/// Inherits rules from County (and transitively from State) unless overridden.
/// </summary>
public class Courthouse : BaseEntity
{
    public string CourthouseCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public Guid CountyId { get; set; }
    public County County { get; set; } = null!;

    public EFilingStatus EFilingStatus { get; set; } = EFilingStatus.NotAvailable;
    public decimal? FilingFeeOverride { get; set; }
    public int? StatuteOfLimitationsMonthsOverride { get; set; }
    public decimal? MinimumBalanceOverride { get; set; }
    public string? AcceptedServiceMethods { get; set; }
    public string? RequiredFormNumbers { get; set; }
    public string? LocalCourtRulesUrl { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<JurisdictionRule> Rules { get; set; } = new List<JurisdictionRule>();
    public ICollection<AttorneyCredential> AuthorizedAttorneys { get; set; } = new List<AttorneyCredential>();
}
