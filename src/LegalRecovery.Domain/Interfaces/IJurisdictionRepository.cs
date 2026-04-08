using LegalRecovery.Domain.Entities;

namespace LegalRecovery.Domain.Interfaces;

public interface IJurisdictionRepository
{
    Task<IReadOnlyList<State>> GetAllStatesAsync(CancellationToken cancellationToken = default);
    Task<State?> GetStateWithHierarchyAsync(Guid stateId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<County>> GetCountiesByStateAsync(Guid stateId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Courthouse>> GetCourthousesByCountyAsync(Guid countyId, CancellationToken cancellationToken = default);
    Task<Courthouse?> GetCourthouseWithHierarchyAsync(Guid courthouseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<JurisdictionRule>> GetEffectiveRulesAsync(Guid? stateId, Guid? countyId, Guid? courthouseId, CancellationToken cancellationToken = default);
    Task BulkUpdateStateRulesAsync(Guid stateId, string ruleKey, string ruleValue, CancellationToken cancellationToken = default);
}
