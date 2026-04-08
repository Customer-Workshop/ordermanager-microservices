using LegalRecovery.Application.Filing.Commands;
using LegalRecovery.Application.Filing.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LegalRecovery.Api.Controllers;

/// <summary>
/// Manages suit filings with e-filing capability matrix for 9,000+ courthouses.
/// Routes filings through e-filing or physical filing based on courthouse capability.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class FilingController : ControllerBase
{
    private readonly IMediator _mediator;

    public FilingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("{accountId}")]
    public async Task<ActionResult<SuitFilingResultDto>> CreateFiling(Guid accountId)
    {
        var result = await _mediator.Send(new CreateSuitFilingCommand { AccountId = accountId });
        return Ok(result);
    }

    [HttpGet("e-filing-matrix")]
    public async Task<ActionResult<EFilingMatrixDto>> GetEFilingMatrix([FromQuery] Guid? stateId)
    {
        var result = await _mediator.Send(new GetEFilingMatrixQuery { StateId = stateId });
        return Ok(result);
    }
}
