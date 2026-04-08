namespace LegalRecovery.Domain.Enums;

/// <summary>
/// The 9 core process stages of the legal recovery workflow.
/// </summary>
public enum ProcessStage
{
    AccountSelection = 1,
    DocumentOrderFulfillment = 2,
    DocumentRedaction = 3,
    ServiceOfProcess = 4,
    AttorneyPlacementReview = 5,
    CourtAppearanceProceedings = 6,
    SuitFiling = 7,
    JudgmentPostJudgment = 8,
    AssetGarnishments = 9
}
