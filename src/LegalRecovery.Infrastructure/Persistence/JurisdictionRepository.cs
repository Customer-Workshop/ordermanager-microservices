using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;
using LegalRecovery.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Infrastructure.Persistence;

public class JurisdictionRepository : IJurisdictionRepository
{
    private readonly ApplicationDbContext _context;

    public JurisdictionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<State>> GetAllStatesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.States.Where(s => s.IsActive).ToListAsync(cancellationToken);
    }

    public async Task<State?> GetStateWithHierarchyAsync(Guid stateId, CancellationToken cancellationToken = default)
    {
        return await _context.States
            .Include(s => s.Counties)
                .ThenInclude(c => c.Courthouses)
            .FirstOrDefaultAsync(s => s.Id == stateId, cancellationToken);
    }

    public async Task<IReadOnlyList<County>> GetCountiesByStateAsync(Guid stateId, CancellationToken cancellationToken = default)
    {
        return await _context.Counties
            .Include(c => c.Courthouses)
            .Where(c => c.StateId == stateId && c.IsActive)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Courthouse>> GetCourthousesByCountyAsync(Guid countyId, CancellationToken cancellationToken = default)
    {
        return await _context.Courthouses
            .Where(c => c.CountyId == countyId && c.IsActive)
            .ToListAsync(cancellationToken);
    }

    public async Task<Courthouse?> GetCourthouseWithHierarchyAsync(Guid courthouseId, CancellationToken cancellationToken = default)
    {
        return await _context.Courthouses
            .Include(c => c.County)
                .ThenInclude(co => co.State)
            .FirstOrDefaultAsync(c => c.Id == courthouseId, cancellationToken);
    }

    public async Task<IReadOnlyList<JurisdictionRule>> GetEffectiveRulesAsync(
        Guid? stateId, Guid? countyId, Guid? courthouseId, CancellationToken cancellationToken = default)
    {
        var rules = await _context.JurisdictionRules
            .Where(r => r.IsActive &&
                        (r.StateId == stateId || r.CountyId == countyId || r.CourthouseId == courthouseId))
            .OrderByDescending(r => r.Level)
            .ToListAsync(cancellationToken);

        return rules;
    }

    public async Task BulkUpdateStateRulesAsync(Guid stateId, string ruleKey, string ruleValue, CancellationToken cancellationToken = default)
    {
        var stateRule = await _context.JurisdictionRules
            .FirstOrDefaultAsync(r => r.StateId == stateId && r.RuleKey == ruleKey && r.IsActive, cancellationToken);

        if (stateRule != null)
        {
            stateRule.RuleValue = ruleValue;
            stateRule.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            _context.JurisdictionRules.Add(new JurisdictionRule
            {
                RuleKey = ruleKey,
                RuleValue = ruleValue,
                Level = JurisdictionLevel.State,
                StateId = stateId
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
