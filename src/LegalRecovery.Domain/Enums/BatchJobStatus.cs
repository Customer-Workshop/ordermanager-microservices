namespace LegalRecovery.Domain.Enums;

public enum BatchJobStatus
{
    Active = 1,
    Migrated = 2,
    InParallel = 3,
    Decommissioned = 4,
    Retired = 5
}
