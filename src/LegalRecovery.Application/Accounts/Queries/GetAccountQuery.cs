using LegalRecovery.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Accounts.Queries;

public record GetAccountQuery : IRequest<AccountDetailDto>
{
    public Guid AccountId { get; init; }
}

public class AccountDetailDto
{
    public Guid Id { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public string DebtorName { get; set; } = string.Empty;
    public decimal OriginalBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public string ProductType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string CurrentStage { get; set; } = string.Empty;
    public decimal? SelectionScore { get; set; }
    public string? CaseNumber { get; set; }
    public string? StateName { get; set; }
    public string? CountyName { get; set; }
    public string? CourthouseName { get; set; }
    public string? AttorneyName { get; set; }
}

public class GetAccountQueryHandler : IRequestHandler<GetAccountQuery, AccountDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetAccountQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AccountDetailDto> Handle(GetAccountQuery request, CancellationToken cancellationToken)
    {
        var account = await _context.Accounts
            .Include(a => a.State)
            .Include(a => a.County)
            .Include(a => a.Courthouse)
            .Include(a => a.AssignedAttorney)
            .FirstOrDefaultAsync(a => a.Id == request.AccountId, cancellationToken)
            ?? throw new KeyNotFoundException($"Account {request.AccountId} not found");

        return new AccountDetailDto
        {
            Id = account.Id,
            AccountNumber = account.AccountNumber,
            DebtorName = account.DebtorName,
            OriginalBalance = account.OriginalBalance,
            CurrentBalance = account.CurrentBalance,
            ProductType = account.ProductType,
            Status = account.Status.ToString(),
            CurrentStage = account.CurrentStage.ToString(),
            SelectionScore = account.SelectionScore,
            CaseNumber = account.CaseNumber,
            StateName = account.State?.Name,
            CountyName = account.County?.Name,
            CourthouseName = account.Courthouse?.Name,
            AttorneyName = account.AssignedAttorney != null
                ? $"{account.AssignedAttorney.FirstName} {account.AssignedAttorney.LastName}"
                : null
        };
    }
}
