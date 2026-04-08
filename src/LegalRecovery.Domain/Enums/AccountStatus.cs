namespace LegalRecovery.Domain.Enums;

public enum AccountStatus
{
    New = 1,
    Selected = 2,
    DocumentOrdered = 3,
    DocumentRedacted = 4,
    ServiceInProgress = 5,
    AttorneyPlaced = 6,
    CourtAppearance = 7,
    SuitFiled = 8,
    JudgmentObtained = 9,
    GarnishmentIssued = 10,
    Closed = 11,
    Excluded = 12
}
