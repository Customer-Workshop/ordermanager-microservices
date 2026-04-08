using LegalRecovery.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Jurisdictions.Queries;

public record GetJurisdictionHierarchyQuery : IRequest<JurisdictionHierarchyDto>
{
    public Guid StateId { get; init; }
}

public class JurisdictionHierarchyDto
{
    public Guid StateId { get; set; }
    public string StateCode { get; set; } = string.Empty;
    public string StateName { get; set; } = string.Empty;
    public int StatuteOfLimitationsMonths { get; set; }
    public decimal DefaultMinimumBalance { get; set; }
    public List<CountyDto> Counties { get; set; } = new();
}

public class CountyDto
{
    public Guid CountyId { get; set; }
    public string FipsCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int? StatuteOfLimitationsMonthsOverride { get; set; }
    public decimal? MinimumBalanceOverride { get; set; }
    public List<CourthouseDto> Courthouses { get; set; } = new();
}

public class CourthouseDto
{
    public Guid CourthouseId { get; set; }
    public string CourthouseCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string EFilingStatus { get; set; } = string.Empty;
    public decimal? FilingFeeOverride { get; set; }
    public int EffectiveStatuteOfLimitationsMonths { get; set; }
    public decimal EffectiveMinimumBalance { get; set; }
}

public class GetJurisdictionHierarchyQueryHandler : IRequestHandler<GetJurisdictionHierarchyQuery, JurisdictionHierarchyDto>
{
    private readonly IApplicationDbContext _context;

    public GetJurisdictionHierarchyQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<JurisdictionHierarchyDto> Handle(GetJurisdictionHierarchyQuery request, CancellationToken cancellationToken)
    {
        var state = await _context.States
            .Include(s => s.Counties)
                .ThenInclude(c => c.Courthouses)
            .FirstOrDefaultAsync(s => s.Id == request.StateId, cancellationToken)
            ?? throw new KeyNotFoundException($"State {request.StateId} not found");

        return new JurisdictionHierarchyDto
        {
            StateId = state.Id,
            StateCode = state.Code,
            StateName = state.Name,
            StatuteOfLimitationsMonths = state.StatuteOfLimitationsMonths,
            DefaultMinimumBalance = state.DefaultMinimumBalance,
            Counties = state.Counties.Select(c => new CountyDto
            {
                CountyId = c.Id,
                FipsCode = c.FipsCode,
                Name = c.Name,
                StatuteOfLimitationsMonthsOverride = c.StatuteOfLimitationsMonthsOverride,
                MinimumBalanceOverride = c.MinimumBalanceOverride,
                Courthouses = c.Courthouses.Select(ch => new CourthouseDto
                {
                    CourthouseId = ch.Id,
                    CourthouseCode = ch.CourthouseCode,
                    Name = ch.Name,
                    EFilingStatus = ch.EFilingStatus.ToString(),
                    FilingFeeOverride = ch.FilingFeeOverride,
                    EffectiveStatuteOfLimitationsMonths = ch.StatuteOfLimitationsMonthsOverride
                        ?? c.StatuteOfLimitationsMonthsOverride
                        ?? state.StatuteOfLimitationsMonths,
                    EffectiveMinimumBalance = ch.MinimumBalanceOverride
                        ?? c.MinimumBalanceOverride
                        ?? state.DefaultMinimumBalance
                }).ToList()
            }).ToList()
        };
    }
}
