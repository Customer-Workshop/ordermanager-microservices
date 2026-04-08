using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Garnishments.Commands;

/// <summary>
/// Creates a garnishment writ with template selection following the
/// courthouse > county > state inheritance model.
/// </summary>
public record CreateGarnishmentWritCommand : IRequest<Guid>
{
    public Guid AccountId { get; init; }
    public string WritType { get; init; } = string.Empty;
    public string? EmployerName { get; init; }
    public string? BankName { get; init; }
    public decimal GarnishmentAmount { get; init; }
}

public class CreateGarnishmentWritCommandHandler : IRequestHandler<CreateGarnishmentWritCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IDocumentTemplateRepository _templateRepository;

    public CreateGarnishmentWritCommandHandler(
        IApplicationDbContext context, IDocumentTemplateRepository templateRepository)
    {
        _context = context;
        _templateRepository = templateRepository;
    }

    public async Task<Guid> Handle(CreateGarnishmentWritCommand request, CancellationToken cancellationToken)
    {
        var account = await _context.Accounts
            .Include(a => a.Courthouse)
                .ThenInclude(c => c!.County)
            .FirstOrDefaultAsync(a => a.Id == request.AccountId, cancellationToken)
            ?? throw new KeyNotFoundException($"Account {request.AccountId} not found");

        if (account.Courthouse == null)
            throw new InvalidOperationException("Account must have a courthouse assigned for garnishment");

        // Find the best matching template using jurisdiction inheritance
        var template = await _templateRepository.FindBestMatchAsync(
            account.Courthouse.County.StateId,
            account.Courthouse.CountyId,
            account.CourthouseId,
            "GarnishmentWrit",
            request.WritType,
            cancellationToken);

        var writ = new GarnishmentWrit
        {
            AccountId = account.Id,
            CourthouseId = account.Courthouse.Id,
            TemplateId = template?.Id,
            WritType = request.WritType,
            EmployerName = request.EmployerName,
            BankName = request.BankName,
            GarnishmentAmount = request.GarnishmentAmount,
            IssuedDate = DateTime.UtcNow
        };

        _context.GarnishmentWrits.Add(writ);
        await _context.SaveChangesAsync(cancellationToken);
        return writ.Id;
    }
}
