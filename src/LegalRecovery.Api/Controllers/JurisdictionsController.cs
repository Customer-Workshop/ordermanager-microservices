using LegalRecovery.Application.Jurisdictions.Commands;
using LegalRecovery.Application.Jurisdictions.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LegalRecovery.Api.Controllers;

/// <summary>
/// Manages the jurisdiction hierarchy: State > County > Courthouse.
/// Supports hierarchical rule configuration with inheritance and override.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class JurisdictionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public JurisdictionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("states")]
    public async Task<ActionResult<List<StateListDto>>> GetAllStates()
    {
        var result = await _mediator.Send(new GetAllStatesQuery());
        return Ok(result);
    }

    [HttpGet("states/{stateId}/hierarchy")]
    public async Task<ActionResult<JurisdictionHierarchyDto>> GetHierarchy(Guid stateId)
    {
        var result = await _mediator.Send(new GetJurisdictionHierarchyQuery { StateId = stateId });
        return Ok(result);
    }

    [HttpPost("states")]
    public async Task<ActionResult<Guid>> CreateState(CreateStateCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetHierarchy), new { stateId = id }, id);
    }

    [HttpPost("counties")]
    public async Task<ActionResult<Guid>> CreateCounty(CreateCountyCommand command)
    {
        var id = await _mediator.Send(command);
        return Created($"/api/jurisdictions/counties/{id}", id);
    }

    [HttpPost("courthouses")]
    public async Task<ActionResult<Guid>> CreateCourthouse(CreateCourthouseCommand command)
    {
        var id = await _mediator.Send(command);
        return Created($"/api/jurisdictions/courthouses/{id}", id);
    }

    [HttpPut("rules")]
    public async Task<ActionResult<Guid>> UpsertRule(UpsertJurisdictionRuleCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(id);
    }
}
