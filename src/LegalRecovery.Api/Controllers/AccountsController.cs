using LegalRecovery.Application.Accounts.Commands;
using LegalRecovery.Application.Accounts.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LegalRecovery.Api.Controllers;

/// <summary>
/// Manages accounts flowing through the 9 legal recovery process stages.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AccountsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{accountId}")]
    public async Task<ActionResult<AccountDetailDto>> GetAccount(Guid accountId)
    {
        var result = await _mediator.Send(new GetAccountQuery { AccountId = accountId });
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> CreateAccount(CreateAccountCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAccount), new { accountId = id }, id);
    }

    [HttpPost("{accountId}/evaluate-selection")]
    public async Task<ActionResult<AccountSelectionResultDto>> EvaluateSelection(Guid accountId)
    {
        var result = await _mediator.Send(new EvaluateAccountSelectionCommand { AccountId = accountId });
        return Ok(result);
    }
}
