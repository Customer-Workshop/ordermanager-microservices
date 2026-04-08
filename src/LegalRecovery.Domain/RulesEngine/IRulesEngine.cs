using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;

namespace LegalRecovery.Domain.RulesEngine;

/// <summary>
/// Configurable rules engine that evaluates rules at the jurisdiction hierarchy level.
/// Supports the inheritance model: Courthouse > County > State.
/// All configurations can be done without deployment via UI.
/// </summary>
public interface IRulesEngine
{
    Task<RuleEvaluationResult> EvaluateAccountSelectionAsync(Account account, CancellationToken cancellationToken = default);
    Task<string> GetEffectiveRuleValueAsync(string ruleKey, Guid? stateId, Guid? countyId, Guid? courthouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<JurisdictionRule>> GetEffectiveRulesForJurisdictionAsync(Guid? stateId, Guid? countyId, Guid? courthouseId, ProcessStage? stage = null, CancellationToken cancellationToken = default);
    Task<decimal> GetEffectiveMinimumBalanceAsync(Guid? stateId, Guid? countyId, Guid? courthouseId, CancellationToken cancellationToken = default);
    Task<int> GetEffectiveStatuteOfLimitationsAsync(Guid? stateId, Guid? countyId, Guid? courthouseId, CancellationToken cancellationToken = default);
}
