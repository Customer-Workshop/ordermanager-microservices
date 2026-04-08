namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Tracks an attorney's credentials at a specific jurisdiction level.
/// Supports courthouse-level bar admission and local counsel requirements.
/// </summary>
public class AttorneyCredential : BaseEntity
{
    public Guid AttorneyId { get; set; }
    public Attorney Attorney { get; set; } = null!;

    public Guid StateId { get; set; }
    public State State { get; set; } = null!;

    public Guid? CountyId { get; set; }
    public County? County { get; set; }

    public Guid? CourthouseId { get; set; }
    public Courthouse? Courthouse { get; set; }

    public string BarAdmissionNumber { get; set; } = string.Empty;
    public DateTime AdmissionDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public bool IsLocalCounsel { get; set; }
    public bool IsActive { get; set; } = true;
}
