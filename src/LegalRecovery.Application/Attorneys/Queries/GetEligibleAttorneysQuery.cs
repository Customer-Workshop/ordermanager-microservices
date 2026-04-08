using LegalRecovery.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Attorneys.Queries;

public record GetEligibleAttorneysQuery : IRequest<List<EligibleAttorneyDto>>
{
    public Guid CourthouseId { get; init; }
}

public class EligibleAttorneyDto
{
    public Guid AttorneyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BarNumber { get; set; } = string.Empty;
    public string FirmName { get; set; } = string.Empty;
    public int CurrentCaseCount { get; set; }
    public int MaxCaseLoad { get; set; }
    public string CredentialLevel { get; set; } = string.Empty;
    public bool IsLocalCounsel { get; set; }
}

public class GetEligibleAttorneysQueryHandler : IRequestHandler<GetEligibleAttorneysQuery, List<EligibleAttorneyDto>>
{
    private readonly IApplicationDbContext _context;

    public GetEligibleAttorneysQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<EligibleAttorneyDto>> Handle(
        GetEligibleAttorneysQuery request, CancellationToken cancellationToken)
    {
        var courthouse = await _context.Courthouses
            .Include(c => c.County)
            .FirstOrDefaultAsync(c => c.Id == request.CourthouseId, cancellationToken)
            ?? throw new KeyNotFoundException($"Courthouse {request.CourthouseId} not found");

        var credentials = await _context.AttorneyCredentials
            .Include(c => c.Attorney)
            .Where(c => c.IsActive &&
                        c.Attorney.IsActive &&
                        (c.CourthouseId == request.CourthouseId ||
                         (c.CountyId == courthouse.CountyId && c.CourthouseId == null) ||
                         (c.StateId == courthouse.County.StateId && c.CountyId == null && c.CourthouseId == null)))
            .ToListAsync(cancellationToken);

        return credentials.Select(c => new EligibleAttorneyDto
        {
            AttorneyId = c.AttorneyId,
            Name = $"{c.Attorney.FirstName} {c.Attorney.LastName}",
            BarNumber = c.Attorney.BarNumber,
            FirmName = c.Attorney.FirmName,
            CurrentCaseCount = c.Attorney.CurrentCaseCount,
            MaxCaseLoad = c.Attorney.MaxCaseLoad,
            CredentialLevel = c.CourthouseId.HasValue ? "Courthouse" : c.CountyId.HasValue ? "County" : "State",
            IsLocalCounsel = c.IsLocalCounsel
        }).OrderByDescending(a => a.CredentialLevel == "Courthouse")
          .ThenBy(a => a.CurrentCaseCount)
          .ToList();
    }
}
