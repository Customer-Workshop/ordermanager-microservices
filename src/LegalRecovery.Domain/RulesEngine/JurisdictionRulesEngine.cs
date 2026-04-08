using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;
using LegalRecovery.Domain.Interfaces;

namespace LegalRecovery.Domain.RulesEngine;

/// <summary>
/// Implements the hierarchical jurisdiction rules engine.
/// Rules at lower levels (courthouse) override rules at higher levels (county, state).
/// When a new courthouse is added, it inherits its county's rules by default.
/// </summary>
public class JurisdictionRulesEngine : IRulesEngine
{
    private readonly IJurisdictionRepository _jurisdictionRepository;

    public JurisdictionRulesEngine(IJurisdictionRepository jurisdictionRepository)
    {
        _jurisdictionRepository = jurisdictionRepository;
    }

    public async Task<RuleEvaluationResult> EvaluateAccountSelectionAsync(
        Account account, CancellationToken cancellationToken = default)
    {
        var result = new RuleEvaluationResult();

        var effectiveRules = await _jurisdictionRepository.GetEffectiveRulesAsync(
            account.StateId, account.CountyId, account.CourthouseId, cancellationToken);

        var minimumBalance = await GetEffectiveMinimumBalanceAsync(
            account.StateId, account.CountyId, account.CourthouseId, cancellationToken);

        var solMonths = await GetEffectiveStatuteOfLimitationsAsync(
            account.StateId, account.CountyId, account.CourthouseId, cancellationToken);

        // Build jurisdiction path for traceability
        result.JurisdictionPath = await BuildJurisdictionPathAsync(
            account.StateId, account.CountyId, account.CourthouseId, cancellationToken);

        // Apply minimum balance rule
        if (account.CurrentBalance < minimumBalance)
        {
            result.IsEligible = false;
            result.ExclusionReasons.Add($"Balance {account.CurrentBalance:C} below minimum {minimumBalance:C}");
            return result;
        }
        result.AppliedRules.Add($"MinimumBalance: {minimumBalance:C} (passed)");

        // Apply selection-stage rules
        foreach (var rule in effectiveRules.Where(r => r.ApplicableStage == ProcessStage.AccountSelection))
        {
            result.EffectiveRuleValues[rule.RuleKey] = rule.RuleValue;
            result.AppliedRules.Add($"{rule.RuleKey}: {rule.RuleValue} (Level: {rule.Level})");
        }

        result.IsEligible = true;
        result.Score = CalculateSelectionScore(account, effectiveRules);
        return result;
    }

    public async Task<string> GetEffectiveRuleValueAsync(
        string ruleKey, Guid? stateId, Guid? countyId, Guid? courthouseId,
        CancellationToken cancellationToken = default)
    {
        var rules = await _jurisdictionRepository.GetEffectiveRulesAsync(
            stateId, countyId, courthouseId, cancellationToken);

        // Most specific rule wins: Courthouse > County > State
        var effectiveRule = rules
            .Where(r => r.RuleKey == ruleKey && r.IsActive)
            .OrderByDescending(r => r.Level)
            .FirstOrDefault();

        return effectiveRule?.RuleValue ?? string.Empty;
    }

    public async Task<IReadOnlyList<JurisdictionRule>> GetEffectiveRulesForJurisdictionAsync(
        Guid? stateId, Guid? countyId, Guid? courthouseId,
        ProcessStage? stage = null, CancellationToken cancellationToken = default)
    {
        var allRules = await _jurisdictionRepository.GetEffectiveRulesAsync(
            stateId, countyId, courthouseId, cancellationToken);

        if (stage.HasValue)
        {
            allRules = allRules
                .Where(r => r.ApplicableStage == stage || r.ApplicableStage == null)
                .ToList();
        }

        // For each unique rule key, return only the most specific (highest level) rule
        var effectiveRules = allRules
            .GroupBy(r => r.RuleKey)
            .Select(g => g.OrderByDescending(r => r.Level).First())
            .ToList();

        return effectiveRules;
    }

    public async Task<decimal> GetEffectiveMinimumBalanceAsync(
        Guid? stateId, Guid? countyId, Guid? courthouseId,
        CancellationToken cancellationToken = default)
    {
        if (courthouseId.HasValue)
        {
            var courthouse = await _jurisdictionRepository.GetCourthouseWithHierarchyAsync(
                courthouseId.Value, cancellationToken);
            if (courthouse?.MinimumBalanceOverride.HasValue == true)
                return courthouse.MinimumBalanceOverride.Value;
            if (courthouse?.County.MinimumBalanceOverride.HasValue == true)
                return courthouse.County.MinimumBalanceOverride.Value;
            return courthouse?.County.State.DefaultMinimumBalance ?? 0m;
        }

        if (countyId.HasValue)
        {
            var counties = await _jurisdictionRepository.GetCountiesByStateAsync(
                stateId ?? Guid.Empty, cancellationToken);
            var county = counties.FirstOrDefault(c => c.Id == countyId);
            if (county?.MinimumBalanceOverride.HasValue == true)
                return county.MinimumBalanceOverride.Value;
        }

        if (stateId.HasValue)
        {
            var state = await _jurisdictionRepository.GetStateWithHierarchyAsync(
                stateId.Value, cancellationToken);
            return state?.DefaultMinimumBalance ?? 0m;
        }

        return 0m;
    }

    public async Task<int> GetEffectiveStatuteOfLimitationsAsync(
        Guid? stateId, Guid? countyId, Guid? courthouseId,
        CancellationToken cancellationToken = default)
    {
        if (courthouseId.HasValue)
        {
            var courthouse = await _jurisdictionRepository.GetCourthouseWithHierarchyAsync(
                courthouseId.Value, cancellationToken);
            if (courthouse?.StatuteOfLimitationsMonthsOverride.HasValue == true)
                return courthouse.StatuteOfLimitationsMonthsOverride.Value;
            if (courthouse?.County.StatuteOfLimitationsMonthsOverride.HasValue == true)
                return courthouse.County.StatuteOfLimitationsMonthsOverride.Value;
            return courthouse?.County.State.StatuteOfLimitationsMonths ?? 0;
        }

        if (stateId.HasValue)
        {
            var state = await _jurisdictionRepository.GetStateWithHierarchyAsync(
                stateId.Value, cancellationToken);
            return state?.StatuteOfLimitationsMonths ?? 0;
        }

        return 0;
    }

    private static decimal CalculateSelectionScore(Account account, IReadOnlyList<JurisdictionRule> rules)
    {
        var score = 0m;
        score += Math.Min(account.CurrentBalance / 1000m, 100m);

        foreach (var rule in rules.Where(r => r.RuleKey.StartsWith("ScoreWeight_")))
        {
            if (decimal.TryParse(rule.RuleValue, out var weight))
            {
                score += weight;
            }
        }

        return Math.Round(score, 2);
    }

    private async Task<string> BuildJurisdictionPathAsync(
        Guid? stateId, Guid? countyId, Guid? courthouseId,
        CancellationToken cancellationToken)
    {
        var parts = new List<string>();

        if (stateId.HasValue)
        {
            var state = await _jurisdictionRepository.GetStateWithHierarchyAsync(
                stateId.Value, cancellationToken);
            if (state != null) parts.Add(state.Name);
        }

        if (countyId.HasValue && stateId.HasValue)
        {
            var counties = await _jurisdictionRepository.GetCountiesByStateAsync(
                stateId.Value, cancellationToken);
            var county = counties.FirstOrDefault(c => c.Id == countyId);
            if (county != null) parts.Add(county.Name);
        }

        if (courthouseId.HasValue)
        {
            var courthouse = await _jurisdictionRepository.GetCourthouseWithHierarchyAsync(
                courthouseId.Value, cancellationToken);
            if (courthouse != null) parts.Add(courthouse.Name);
        }

        return string.Join(" > ", parts);
    }
}
