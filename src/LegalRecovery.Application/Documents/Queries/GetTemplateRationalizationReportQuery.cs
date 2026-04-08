using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Documents.Queries;

public record GetTemplateRationalizationReportQuery : IRequest<TemplateRationalizationReportDto>;

public class TemplateRationalizationReportDto
{
    public int TotalCount { get; set; }
    public int ActiveCount { get; set; }
    public int RetiredCount { get; set; }
    public int ConsolidatedCount { get; set; }
    public int CandidatesForRetirement { get; set; }
    public int RemainingActiveCount { get; set; }
    public double EstimatedReductionPercent { get; set; }
}

public class GetTemplateRationalizationReportQueryHandler
    : IRequestHandler<GetTemplateRationalizationReportQuery, TemplateRationalizationReportDto>
{
    private readonly IApplicationDbContext _context;

    public GetTemplateRationalizationReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TemplateRationalizationReportDto> Handle(
        GetTemplateRationalizationReportQuery request, CancellationToken cancellationToken)
    {
        var templates = await _context.DocumentTemplates.ToListAsync(cancellationToken);
        var total = templates.Count;
        var active = templates.Count(t => t.Status == TemplateStatus.Active);
        var retired = templates.Count(t => t.Status == TemplateStatus.Retired);
        var consolidated = templates.Count(t => t.Status == TemplateStatus.Consolidated);
        var candidates = templates.Count(t => t.Status == TemplateStatus.CandidateForRetirement);

        return new TemplateRationalizationReportDto
        {
            TotalCount = total,
            ActiveCount = active,
            RetiredCount = retired,
            ConsolidatedCount = consolidated,
            CandidatesForRetirement = candidates,
            RemainingActiveCount = active - candidates,
            EstimatedReductionPercent = total > 0 ? Math.Round((double)(retired + consolidated + candidates) / total * 100, 1) : 0
        };
    }
}
