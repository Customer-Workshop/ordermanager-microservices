using LegalRecovery.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Attorneys.Commands;

/// <summary>
/// Assigns an attorney to an account based on courthouse-level bar admission
/// and local counsel requirements.
/// </summary>
public record AssignAttorneyCommand : IRequest<AttorneyAssignmentResultDto>
{
    public Guid AccountId { get; init; }
}

public class AttorneyAssignmentResultDto
{
    public Guid AccountId { get; set; }
    public Guid? AttorneyId { get; set; }
    public string? AttorneyName { get; set; }
    public bool IsAssigned { get; set; }
    public string? Reason { get; set; }
}

public class AssignAttorneyCommandHandler : IRequestHandler<AssignAttorneyCommand, AttorneyAssignmentResultDto>
{
    private readonly IApplicationDbContext _context;

    public AssignAttorneyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AttorneyAssignmentResultDto> Handle(
        AssignAttorneyCommand request, CancellationToken cancellationToken)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == request.AccountId, cancellationToken)
            ?? throw new KeyNotFoundException($"Account {request.AccountId} not found");

        if (!account.CourthouseId.HasValue)
        {
            return new AttorneyAssignmentResultDto
            {
                AccountId = account.Id,
                IsAssigned = false,
                Reason = "Account has no courthouse assigned"
            };
        }

        // Find eligible attorneys with valid credentials for this courthouse
        var eligibleAttorneys = await _context.AttorneyCredentials
            .Include(c => c.Attorney)
            .Where(c => c.IsActive &&
                        c.Attorney.IsActive &&
                        c.Attorney.CurrentCaseCount < c.Attorney.MaxCaseLoad &&
                        (c.CourthouseId == account.CourthouseId ||
                         (c.CountyId == account.CountyId && c.CourthouseId == null) ||
                         (c.StateId == account.StateId && c.CountyId == null && c.CourthouseId == null)))
            .OrderByDescending(c => c.CourthouseId.HasValue) // Prefer courthouse-level credentials
            .ThenByDescending(c => c.CountyId.HasValue)
            .ThenBy(c => c.Attorney.CurrentCaseCount) // Least loaded first
            .ToListAsync(cancellationToken);

        if (eligibleAttorneys.Count == 0)
        {
            return new AttorneyAssignmentResultDto
            {
                AccountId = account.Id,
                IsAssigned = false,
                Reason = "No eligible attorneys found for this courthouse"
            };
        }

        var selected = eligibleAttorneys.First();
        account.AssignedAttorneyId = selected.AttorneyId;
        selected.Attorney.CurrentCaseCount++;
        await _context.SaveChangesAsync(cancellationToken);

        return new AttorneyAssignmentResultDto
        {
            AccountId = account.Id,
            AttorneyId = selected.AttorneyId,
            AttorneyName = $"{selected.Attorney.FirstName} {selected.Attorney.LastName}",
            IsAssigned = true,
            Reason = $"Assigned based on {(selected.CourthouseId.HasValue ? "courthouse" : selected.CountyId.HasValue ? "county" : "state")}-level credential"
        };
    }
}
