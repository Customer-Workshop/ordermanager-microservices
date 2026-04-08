using LegalRecovery.Application.Attorneys.Commands;
using LegalRecovery.Application.Attorneys.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LegalRecovery.Api.Controllers;

/// <summary>
/// Manages attorneys with courthouse-level bar admission and credential tracking.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AttorneysController : ControllerBase
{
    private readonly IMediator _mediator;

    public AttorneysController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> CreateAttorney(CreateAttorneyCommand command)
    {
        var id = await _mediator.Send(command);
        return Created($"/api/attorneys/{id}", id);
    }

    [HttpPost("assign/{accountId}")]
    public async Task<ActionResult<AttorneyAssignmentResultDto>> AssignAttorney(Guid accountId)
    {
        var result = await _mediator.Send(new AssignAttorneyCommand { AccountId = accountId });
        return Ok(result);
    }

    [HttpGet("eligible/{courthouseId}")]
    public async Task<ActionResult<List<EligibleAttorneyDto>>> GetEligibleAttorneys(Guid courthouseId)
    {
        var result = await _mediator.Send(new GetEligibleAttorneysQuery { CourthouseId = courthouseId });
        return Ok(result);
    }
}
