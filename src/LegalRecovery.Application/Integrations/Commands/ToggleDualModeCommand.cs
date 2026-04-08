using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Integrations.Commands;

public record ToggleDualModeCommand : IRequest<bool>
{
    public Guid PartnerId { get; init; }
    public bool EnableDualMode { get; init; }
    public IntegrationProtocol? TargetProtocol { get; init; }
    public int? PollingIntervalMinutes { get; init; }
}

public class ToggleDualModeCommandHandler : IRequestHandler<ToggleDualModeCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ToggleDualModeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ToggleDualModeCommand request, CancellationToken cancellationToken)
    {
        var partner = await _context.IntegrationPartners
            .FirstOrDefaultAsync(p => p.Id == request.PartnerId, cancellationToken)
            ?? throw new KeyNotFoundException($"Partner {request.PartnerId} not found");

        partner.IsDualModeEnabled = request.EnableDualMode;
        partner.TargetProtocol = request.TargetProtocol;
        partner.PollingIntervalMinutes = request.PollingIntervalMinutes;
        partner.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
