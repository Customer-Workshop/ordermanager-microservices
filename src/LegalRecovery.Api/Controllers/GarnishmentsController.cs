using LegalRecovery.Application.Garnishments.Commands;
using LegalRecovery.Application.Garnishments.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LegalRecovery.Api.Controllers;

/// <summary>
/// Manages garnishment writs with courthouse-level template selection
/// following the inheritance model (courthouse > county > state).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class GarnishmentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public GarnishmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> CreateGarnishmentWrit(CreateGarnishmentWritCommand command)
    {
        var id = await _mediator.Send(command);
        return Created($"/api/garnishments/{id}", id);
    }

    [HttpGet("account/{accountId}")]
    public async Task<ActionResult<List<GarnishmentWritDto>>> GetByAccount(Guid accountId)
    {
        var result = await _mediator.Send(new GetGarnishmentsByAccountQuery { AccountId = accountId });
        return Ok(result);
    }
}
