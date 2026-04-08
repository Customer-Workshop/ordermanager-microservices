using LegalRecovery.Application.Integrations.Commands;
using LegalRecovery.Application.Integrations.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LegalRecovery.Api.Controllers;

/// <summary>
/// Manages external integration partners (20-30) with SFTP/API dual-mode support.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class IntegrationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public IntegrationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<IntegrationDashboardDto>> GetDashboard()
    {
        var result = await _mediator.Send(new GetIntegrationDashboardQuery());
        return Ok(result);
    }

    [HttpPost("partners")]
    public async Task<ActionResult<Guid>> CreatePartner(CreateIntegrationPartnerCommand command)
    {
        var id = await _mediator.Send(command);
        return Created($"/api/integrations/partners/{id}", id);
    }

    [HttpPut("partners/{partnerId}/dual-mode")]
    public async Task<ActionResult<bool>> ToggleDualMode(Guid partnerId, ToggleDualModeCommand command)
    {
        var updatedCommand = command with { PartnerId = partnerId };
        var result = await _mediator.Send(updatedCommand);
        return Ok(result);
    }
}
