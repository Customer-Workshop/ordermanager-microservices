namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Represents an attorney who can be assigned to accounts.
/// Credentials tracked at the courthouse level for bar admission and local counsel requirements.
/// </summary>
public class Attorney : BaseEntity
{
    public string BarNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FirmName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int MaxCaseLoad { get; set; }
    public int CurrentCaseCount { get; set; }

    public ICollection<AttorneyCredential> Credentials { get; set; } = new List<AttorneyCredential>();
    public ICollection<Account> AssignedAccounts { get; set; } = new List<Account>();
}
