namespace LegalRecovery.Domain.RulesEngine;

public class RuleEvaluationResult
{
    public bool IsEligible { get; set; }
    public decimal Score { get; set; }
    public List<string> AppliedRules { get; set; } = new();
    public List<string> ExclusionReasons { get; set; } = new();
    public Dictionary<string, string> EffectiveRuleValues { get; set; } = new();
    public string JurisdictionPath { get; set; } = string.Empty; // e.g., "CA > Los Angeles > LA Superior Court"
}
