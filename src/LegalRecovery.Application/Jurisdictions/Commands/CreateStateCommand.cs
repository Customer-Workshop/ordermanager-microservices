using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Entities;
using MediatR;

namespace LegalRecovery.Application.Jurisdictions.Commands;

public record CreateStateCommand : IRequest<Guid>
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public int StatuteOfLimitationsMonths { get; init; }
    public decimal DefaultMinimumBalance { get; init; }
}

public class CreateStateCommandHandler : IRequestHandler<CreateStateCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateStateCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateStateCommand request, CancellationToken cancellationToken)
    {
        var state = new State
        {
            Code = request.Code,
            Name = request.Name,
            StatuteOfLimitationsMonths = request.StatuteOfLimitationsMonths,
            DefaultMinimumBalance = request.DefaultMinimumBalance
        };

        _context.States.Add(state);
        await _context.SaveChangesAsync(cancellationToken);
        return state.Id;
    }
}
