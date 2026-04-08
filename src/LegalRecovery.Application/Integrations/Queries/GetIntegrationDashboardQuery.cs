using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Integrations.Queries;

public record GetIntegrationDashboardQuery : IRequest<IntegrationDashboardDto>;

public class IntegrationDashboardDto
{
    public int TotalPartners { get; set; }
    public int SftpOnlyPartners { get; set; }
    public int ApiOnlyPartners { get; set; }
    public int DualModePartners { get; set; }
    public int PartnersWithApiAvailable { get; set; }
    public List<IntegrationPartnerSummaryDto> Partners { get; set; } = new();
}

public class IntegrationPartnerSummaryDto
{
    public Guid Id { get; set; }
    public string PartnerName { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public string CurrentProtocol { get; set; } = string.Empty;
    public bool IsDualMode { get; set; }
    public bool PartnerOffersApi { get; set; }
    public int MigrationPriority { get; set; }
}

public class GetIntegrationDashboardQueryHandler
    : IRequestHandler<GetIntegrationDashboardQuery, IntegrationDashboardDto>
{
    private readonly IApplicationDbContext _context;

    public GetIntegrationDashboardQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IntegrationDashboardDto> Handle(
        GetIntegrationDashboardQuery request, CancellationToken cancellationToken)
    {
        var partners = await _context.IntegrationPartners
            .Where(p => p.IsActive)
            .ToListAsync(cancellationToken);

        return new IntegrationDashboardDto
        {
            TotalPartners = partners.Count,
            SftpOnlyPartners = partners.Count(p => p.CurrentProtocol == IntegrationProtocol.Sftp && !p.IsDualModeEnabled),
            ApiOnlyPartners = partners.Count(p => p.CurrentProtocol == IntegrationProtocol.Api),
            DualModePartners = partners.Count(p => p.IsDualModeEnabled),
            PartnersWithApiAvailable = partners.Count(p => p.PartnerOffersApi),
            Partners = partners.Select(p => new IntegrationPartnerSummaryDto
            {
                Id = p.Id,
                PartnerName = p.PartnerName,
                Direction = p.Direction.ToString(),
                CurrentProtocol = p.CurrentProtocol.ToString(),
                IsDualMode = p.IsDualModeEnabled,
                PartnerOffersApi = p.PartnerOffersApi,
                MigrationPriority = p.MigrationPriority
            }).OrderBy(p => p.MigrationPriority).ToList()
        };
    }
}
