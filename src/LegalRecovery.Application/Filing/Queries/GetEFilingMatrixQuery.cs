using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Filing.Queries;

public record GetEFilingMatrixQuery : IRequest<EFilingMatrixDto>
{
    public Guid? StateId { get; init; }
}

public class EFilingMatrixDto
{
    public int TotalCourthouses { get; set; }
    public int EFilingAvailable { get; set; }
    public int EFilingRequired { get; set; }
    public int EFilingNotAvailable { get; set; }
    public List<CourthouseEFilingDto> Courthouses { get; set; } = new();
}

public class CourthouseEFilingDto
{
    public Guid CourthouseId { get; set; }
    public string CourthouseName { get; set; } = string.Empty;
    public string CountyName { get; set; } = string.Empty;
    public string StateName { get; set; } = string.Empty;
    public string EFilingStatus { get; set; } = string.Empty;
}

public class GetEFilingMatrixQueryHandler : IRequestHandler<GetEFilingMatrixQuery, EFilingMatrixDto>
{
    private readonly IApplicationDbContext _context;

    public GetEFilingMatrixQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EFilingMatrixDto> Handle(GetEFilingMatrixQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Courthouses
            .Include(c => c.County)
                .ThenInclude(co => co.State)
            .Where(c => c.IsActive);

        if (request.StateId.HasValue)
            query = query.Where(c => c.County.StateId == request.StateId);

        var courthouses = await query.ToListAsync(cancellationToken);

        return new EFilingMatrixDto
        {
            TotalCourthouses = courthouses.Count,
            EFilingAvailable = courthouses.Count(c => c.EFilingStatus == EFilingStatus.Available),
            EFilingRequired = courthouses.Count(c => c.EFilingStatus == EFilingStatus.Required),
            EFilingNotAvailable = courthouses.Count(c => c.EFilingStatus == EFilingStatus.NotAvailable),
            Courthouses = courthouses.Select(c => new CourthouseEFilingDto
            {
                CourthouseId = c.Id,
                CourthouseName = c.Name,
                CountyName = c.County.Name,
                StateName = c.County.State.Name,
                EFilingStatus = c.EFilingStatus.ToString()
            }).ToList()
        };
    }
}
