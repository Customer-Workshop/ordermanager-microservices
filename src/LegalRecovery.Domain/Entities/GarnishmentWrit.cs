namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Represents a garnishment writ issued for an account.
/// Template selection follows courthouse > county > state inheritance model.
/// </summary>
public class GarnishmentWrit : BaseEntity
{
    public Guid AccountId { get; set; }
    public Account Account { get; set; } = null!;
    public Guid CourthouseId { get; set; }
    public Courthouse Courthouse { get; set; } = null!;
    public Guid? TemplateId { get; set; }
    public DocumentTemplate? Template { get; set; }
    public string WritType { get; set; } = string.Empty; // Wage, Bank, Property
    public string? EmployerName { get; set; }
    public string? BankName { get; set; }
    public decimal GarnishmentAmount { get; set; }
    public DateTime IssuedDate { get; set; }
    public DateTime? ServedDate { get; set; }
    public string Status { get; set; } = "Pending";
    public string? BlobStoragePath { get; set; }
}
