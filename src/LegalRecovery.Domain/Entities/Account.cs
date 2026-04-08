using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.Entities;

/// <summary>
/// Represents a legal recovery account that flows through the 9 process stages.
/// </summary>
public class Account : BaseEntity
{
    public string AccountNumber { get; set; } = string.Empty;
    public string DebtorName { get; set; } = string.Empty;
    public decimal OriginalBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public string ProductType { get; set; } = string.Empty;
    public AccountStatus Status { get; set; } = AccountStatus.New;
    public ProcessStage CurrentStage { get; set; } = ProcessStage.AccountSelection;

    public Guid? StateId { get; set; }
    public State? State { get; set; }
    public Guid? CountyId { get; set; }
    public County? County { get; set; }
    public Guid? CourthouseId { get; set; }
    public Courthouse? Courthouse { get; set; }

    public Guid? AssignedAttorneyId { get; set; }
    public Attorney? AssignedAttorney { get; set; }

    public decimal? SelectionScore { get; set; }
    public DateTime? DateSelected { get; set; }
    public DateTime? DateFiled { get; set; }
    public DateTime? DateJudgmentObtained { get; set; }
    public string? CaseNumber { get; set; }

    public ICollection<AccountDocument> Documents { get; set; } = new List<AccountDocument>();
    public ICollection<AccountStageHistory> StageHistory { get; set; } = new List<AccountStageHistory>();
}
