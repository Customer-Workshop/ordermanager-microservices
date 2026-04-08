using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Entities;
using MediatR;

namespace LegalRecovery.Application.Jurisdictions.Commands;

public record CreateCountyCommand : IRequest<Guid>
{
    public string FipsCode { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public Guid StateId { get; init; }
    public int? StatuteOfLimitationsMonthsOverride { get; init; }
    public decimal? MinimumBalanceOverride { get; init; }
}

public class CreateCountyCommandHandler : IRequestHandler<CreateCountyCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateCountyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateCountyCommand request, CancellationToken cancellationToken)
    {
        var county = new County
        {
            FipsCode = request.FipsCode,
            Name = request.Name,
            StateId = request.StateId,
            StatuteOfLimitationsMonthsOverride = request.StatuteOfLimitationsMonthsOverride,
            MinimumBalanceOverride = request.MinimumBalanceOverride
        };

        _context.Counties.Add(county);
        await _context.SaveChangesAsync(cancellationToken);
        return county.Id;
    }
}
