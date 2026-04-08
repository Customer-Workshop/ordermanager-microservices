using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Enums;
using LegalRecovery.Domain.Events;
using LegalRecovery.Domain.Interfaces;
using LegalRecovery.Domain.RulesEngine;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Accounts.Commands;

public record EvaluateAccountSelectionCommand : IRequest<AccountSelectionResultDto>
{
    public Guid AccountId { get; init; }
}

public class AccountSelectionResultDto
{
    public Guid AccountId { get; set; }
    public bool IsEligible { get; set; }
    public decimal Score { get; set; }
    public List<string> AppliedRules { get; set; } = new();
    public List<string> ExclusionReasons { get; set; } = new();
    public string JurisdictionPath { get; set; } = string.Empty;
}

public class EvaluateAccountSelectionCommandHandler : IRequestHandler<EvaluateAccountSelectionCommand, AccountSelectionResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IRulesEngine _rulesEngine;
    private readonly IEventPublisher _eventPublisher;

    public EvaluateAccountSelectionCommandHandler(
        IApplicationDbContext context, IRulesEngine rulesEngine, IEventPublisher eventPublisher)
    {
        _context = context;
        _rulesEngine = rulesEngine;
        _eventPublisher = eventPublisher;
    }

    public async Task<AccountSelectionResultDto> Handle(
        EvaluateAccountSelectionCommand request, CancellationToken cancellationToken)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == request.AccountId, cancellationToken)
            ?? throw new KeyNotFoundException($"Account {request.AccountId} not found");

        var result = await _rulesEngine.EvaluateAccountSelectionAsync(account, cancellationToken);

        account.SelectionScore = result.Score;
        if (result.IsEligible)
        {
            account.Status = AccountStatus.Selected;
            account.CurrentStage = ProcessStage.AccountSelection;
            account.DateSelected = DateTime.UtcNow;

            await _eventPublisher.PublishAsync(new AccountStageTransitionEvent
            {
                AccountId = account.Id,
                AccountNumber = account.AccountNumber,
                FromStage = ProcessStage.AccountSelection,
                ToStage = ProcessStage.DocumentOrderFulfillment,
                CourthouseId = account.CourthouseId,
                Reason = "Account passed selection criteria"
            }, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new AccountSelectionResultDto
        {
            AccountId = account.Id,
            IsEligible = result.IsEligible,
            Score = result.Score,
            AppliedRules = result.AppliedRules,
            ExclusionReasons = result.ExclusionReasons,
            JurisdictionPath = result.JurisdictionPath
        };
    }
}
