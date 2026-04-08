using LegalRecovery.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Jurisdictions.Queries;

public record GetAllStatesQuery : IRequest<List<StateListDto>>;

public class StateListDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int CountyCount { get; set; }
    public int CourthouseCount { get; set; }
    public bool IsActive { get; set; }
}

public class GetAllStatesQueryHandler : IRequestHandler<GetAllStatesQuery, List<StateListDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllStatesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<StateListDto>> Handle(GetAllStatesQuery request, CancellationToken cancellationToken)
    {
        return await _context.States
            .Include(s => s.Counties)
                .ThenInclude(c => c.Courthouses)
            .Select(s => new StateListDto
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                CountyCount = s.Counties.Count,
                CourthouseCount = s.Counties.SelectMany(c => c.Courthouses).Count(),
                IsActive = s.IsActive
            })
            .ToListAsync(cancellationToken);
    }
}
