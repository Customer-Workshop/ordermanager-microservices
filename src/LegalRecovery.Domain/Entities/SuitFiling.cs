using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Represents a suit filing for an account.
/// Routes through e-filing or physical filing based on courthouse capability.
/// </summary>
public class SuitFiling : BaseEntity
{
    public Guid AccountId { get; set; }
    public Account Account { get; set; } = null!;
    public Guid CourthouseId { get; set; }
    public Courthouse Courthouse { get; set; } = null!;
    public bool IsEFiled { get; set; }
    public string? EFilingSystemName { get; set; }
    public string? CaseNumber { get; set; }
    public string? ConfirmationNumber { get; set; }
    public DateTime FilingDate { get; set; }
    public string FilingStatus { get; set; } = "Pending";
    public string? RejectionReason { get; set; }
    public decimal FilingFee { get; set; }
    public string? TrackingNumber { get; set; } // For physical filings
}
