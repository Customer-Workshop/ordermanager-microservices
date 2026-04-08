using LegalRecovery.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Garnishments.Queries;

public record GetGarnishmentsByAccountQuery : IRequest<List<GarnishmentWritDto>>
{
    public Guid AccountId { get; init; }
}

public class GarnishmentWritDto
{
    public Guid Id { get; set; }
    public string WritType { get; set; } = string.Empty;
    public string? EmployerName { get; set; }
    public string? BankName { get; set; }
    public decimal GarnishmentAmount { get; set; }
    public DateTime IssuedDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? TemplateName { get; set; }
    public string CourthouseName { get; set; } = string.Empty;
}

public class GetGarnishmentsByAccountQueryHandler
    : IRequestHandler<GetGarnishmentsByAccountQuery, List<GarnishmentWritDto>>
{
    private readonly IApplicationDbContext _context;

    public GetGarnishmentsByAccountQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GarnishmentWritDto>> Handle(
        GetGarnishmentsByAccountQuery request, CancellationToken cancellationToken)
    {
        return await _context.GarnishmentWrits
            .Include(w => w.Template)
            .Include(w => w.Courthouse)
            .Where(w => w.AccountId == request.AccountId)
            .Select(w => new GarnishmentWritDto
            {
                Id = w.Id,
                WritType = w.WritType,
                EmployerName = w.EmployerName,
                BankName = w.BankName,
                GarnishmentAmount = w.GarnishmentAmount,
                IssuedDate = w.IssuedDate,
                Status = w.Status,
                TemplateName = w.Template != null ? w.Template.Name : null,
                CourthouseName = w.Courthouse.Name
            }).ToListAsync(cancellationToken);
    }
}
