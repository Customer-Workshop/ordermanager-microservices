using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Entities;
using MediatR;

namespace LegalRecovery.Application.Accounts.Commands;

public record CreateAccountCommand : IRequest<Guid>
{
    public string AccountNumber { get; init; } = string.Empty;
    public string DebtorName { get; init; } = string.Empty;
    public decimal OriginalBalance { get; init; }
    public decimal CurrentBalance { get; init; }
    public string ProductType { get; init; } = string.Empty;
    public Guid? StateId { get; init; }
    public Guid? CountyId { get; init; }
    public Guid? CourthouseId { get; init; }
}

public class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateAccountCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        var account = new Account
        {
            AccountNumber = request.AccountNumber,
            DebtorName = request.DebtorName,
            OriginalBalance = request.OriginalBalance,
            CurrentBalance = request.CurrentBalance,
            ProductType = request.ProductType,
            StateId = request.StateId,
            CountyId = request.CountyId,
            CourthouseId = request.CourthouseId
        };

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync(cancellationToken);
        return account.Id;
    }
}
