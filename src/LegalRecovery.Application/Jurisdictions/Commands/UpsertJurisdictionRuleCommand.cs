using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Jurisdictions.Commands;

public record UpsertJurisdictionRuleCommand : IRequest<Guid>
{
    public string RuleKey { get; init; } = string.Empty;
    public string RuleValue { get; init; } = string.Empty;
    public string? Description { get; init; }
    public JurisdictionLevel Level { get; init; }
    public ProcessStage? ApplicableStage { get; init; }
    public Guid? StateId { get; init; }
    public Guid? CountyId { get; init; }
    public Guid? CourthouseId { get; init; }
}

public class UpsertJurisdictionRuleCommandHandler : IRequestHandler<UpsertJurisdictionRuleCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public UpsertJurisdictionRuleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(UpsertJurisdictionRuleCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.JurisdictionRules
            .FirstOrDefaultAsync(r =>
                r.RuleKey == request.RuleKey &&
                r.StateId == request.StateId &&
                r.CountyId == request.CountyId &&
                r.CourthouseId == request.CourthouseId &&
                r.IsActive,
                cancellationToken);

        if (existing != null)
        {
            existing.RuleValue = request.RuleValue;
            existing.Description = request.Description;
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return existing.Id;
        }

        var rule = new JurisdictionRule
        {
            RuleKey = request.RuleKey,
            RuleValue = request.RuleValue,
            Description = request.Description,
            Level = request.Level,
            ApplicableStage = request.ApplicableStage,
            StateId = request.StateId,
            CountyId = request.CountyId,
            CourthouseId = request.CourthouseId,
            IsOverride = request.Level != JurisdictionLevel.State
        };

        _context.JurisdictionRules.Add(rule);
        await _context.SaveChangesAsync(cancellationToken);
        return rule.Id;
    }
}
