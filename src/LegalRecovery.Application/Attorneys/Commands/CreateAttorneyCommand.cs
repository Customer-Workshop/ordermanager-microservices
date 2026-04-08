using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Entities;
using MediatR;

namespace LegalRecovery.Application.Attorneys.Commands;

public record CreateAttorneyCommand : IRequest<Guid>
{
    public string BarNumber { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string FirmName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public int MaxCaseLoad { get; init; }
}

public class CreateAttorneyCommandHandler : IRequestHandler<CreateAttorneyCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateAttorneyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateAttorneyCommand request, CancellationToken cancellationToken)
    {
        var attorney = new Attorney
        {
            BarNumber = request.BarNumber,
            FirstName = request.FirstName,
            LastName = request.LastName,
            FirmName = request.FirmName,
            Email = request.Email,
            Phone = request.Phone,
            MaxCaseLoad = request.MaxCaseLoad
        };

        _context.Attorneys.Add(attorney);
        await _context.SaveChangesAsync(cancellationToken);
        return attorney.Id;
    }
}
