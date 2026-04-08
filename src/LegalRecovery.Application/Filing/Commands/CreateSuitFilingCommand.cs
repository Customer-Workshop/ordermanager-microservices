using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;
using LegalRecovery.Domain.Events;
using LegalRecovery.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Filing.Commands;

public record CreateSuitFilingCommand : IRequest<SuitFilingResultDto>
{
    public Guid AccountId { get; init; }
}

public class SuitFilingResultDto
{
    public Guid FilingId { get; set; }
    public Guid AccountId { get; set; }
    public bool IsEFiled { get; set; }
    public string FilingMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? CaseNumber { get; set; }
    public decimal FilingFee { get; set; }
}

public class CreateSuitFilingCommandHandler : IRequestHandler<CreateSuitFilingCommand, SuitFilingResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IEventPublisher _eventPublisher;

    public CreateSuitFilingCommandHandler(IApplicationDbContext context, IEventPublisher eventPublisher)
    {
        _context = context;
        _eventPublisher = eventPublisher;
    }

    public async Task<SuitFilingResultDto> Handle(
        CreateSuitFilingCommand request, CancellationToken cancellationToken)
    {
        var account = await _context.Accounts
            .Include(a => a.Courthouse)
            .FirstOrDefaultAsync(a => a.Id == request.AccountId, cancellationToken)
            ?? throw new KeyNotFoundException($"Account {request.AccountId} not found");

        if (account.Courthouse == null)
            throw new InvalidOperationException("Account must have a courthouse assigned before filing");

        var isEFiled = account.Courthouse.EFilingStatus is EFilingStatus.Available or EFilingStatus.Required;

        var filing = new SuitFiling
        {
            AccountId = account.Id,
            CourthouseId = account.Courthouse.Id,
            IsEFiled = isEFiled,
            FilingDate = DateTime.UtcNow,
            FilingFee = account.Courthouse.FilingFeeOverride ?? 0m,
            FilingStatus = isEFiled ? "Submitted" : "PackageGenerated"
        };

        _context.SuitFilings.Add(filing);

        await _eventPublisher.PublishAsync(new SuitFiledEvent
        {
            AccountId = account.Id,
            CourthouseId = account.Courthouse.Id,
            FilingId = filing.Id,
            IsEFiled = isEFiled
        }, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        return new SuitFilingResultDto
        {
            FilingId = filing.Id,
            AccountId = account.Id,
            IsEFiled = isEFiled,
            FilingMethod = isEFiled ? "E-Filing" : "Physical",
            Status = filing.FilingStatus,
            CaseNumber = filing.CaseNumber,
            FilingFee = filing.FilingFee
        };
    }
}
