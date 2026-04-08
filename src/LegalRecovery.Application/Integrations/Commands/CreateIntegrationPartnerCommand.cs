using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;
using MediatR;

namespace LegalRecovery.Application.Integrations.Commands;

public record CreateIntegrationPartnerCommand : IRequest<Guid>
{
    public string PartnerName { get; init; } = string.Empty;
    public IntegrationDirection Direction { get; init; }
    public IntegrationProtocol CurrentProtocol { get; init; }
    public string DataFormat { get; init; } = string.Empty;
    public string Frequency { get; init; } = string.Empty;
    public int EstimatedDailyVolume { get; init; }
    public int SlaMinutes { get; init; }
    public bool PartnerOffersApi { get; init; }
    public string? ApiEndpointUrl { get; init; }
    public string? SftpHost { get; init; }
    public string? SftpPath { get; init; }
}

public class CreateIntegrationPartnerCommandHandler : IRequestHandler<CreateIntegrationPartnerCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateIntegrationPartnerCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateIntegrationPartnerCommand request, CancellationToken cancellationToken)
    {
        var partner = new IntegrationPartner
        {
            PartnerName = request.PartnerName,
            Direction = request.Direction,
            CurrentProtocol = request.CurrentProtocol,
            DataFormat = request.DataFormat,
            Frequency = request.Frequency,
            EstimatedDailyVolume = request.EstimatedDailyVolume,
            SlaMinutes = request.SlaMinutes,
            PartnerOffersApi = request.PartnerOffersApi,
            ApiEndpointUrl = request.ApiEndpointUrl,
            SftpHost = request.SftpHost,
            SftpPath = request.SftpPath
        };

        _context.IntegrationPartners.Add(partner);
        await _context.SaveChangesAsync(cancellationToken);
        return partner.Id;
    }
}
