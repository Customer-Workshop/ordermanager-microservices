using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;
using MediatR;

namespace LegalRecovery.Application.Jurisdictions.Commands;

public record CreateCourthouseCommand : IRequest<Guid>
{
    public string CourthouseCode { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public Guid CountyId { get; init; }
    public EFilingStatus EFilingStatus { get; init; }
    public decimal? FilingFeeOverride { get; init; }
    public int? StatuteOfLimitationsMonthsOverride { get; init; }
    public decimal? MinimumBalanceOverride { get; init; }
    public string? AcceptedServiceMethods { get; init; }
}

public class CreateCourthouseCommandHandler : IRequestHandler<CreateCourthouseCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateCourthouseCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateCourthouseCommand request, CancellationToken cancellationToken)
    {
        var courthouse = new Courthouse
        {
            CourthouseCode = request.CourthouseCode,
            Name = request.Name,
            Address = request.Address,
            CountyId = request.CountyId,
            EFilingStatus = request.EFilingStatus,
            FilingFeeOverride = request.FilingFeeOverride,
            StatuteOfLimitationsMonthsOverride = request.StatuteOfLimitationsMonthsOverride,
            MinimumBalanceOverride = request.MinimumBalanceOverride,
            AcceptedServiceMethods = request.AcceptedServiceMethods
        };

        _context.Courthouses.Add(courthouse);
        await _context.SaveChangesAsync(cancellationToken);
        return courthouse.Id;
    }
}
