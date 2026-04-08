using LegalRecovery.Application.BatchMigration.Commands;
using LegalRecovery.Application.BatchMigration.Queries;
using LegalRecovery.Infrastructure.BatchCoexistence;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LegalRecovery.Api.Controllers;

/// <summary>
/// Manages the batch-to-event migration for ~2,100 legacy batch jobs.
/// Provides migration dashboard and reconciliation capabilities.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BatchMigrationController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly BatchEventReconciliationService _reconciliationService;

    public BatchMigrationController(IMediator mediator, BatchEventReconciliationService reconciliationService)
    {
        _mediator = mediator;
        _reconciliationService = reconciliationService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<BatchMigrationDashboardDto>> GetDashboard()
    {
        var result = await _mediator.Send(new GetBatchMigrationDashboardQuery());
        return Ok(result);
    }

    [HttpPut("jobs/{jobId}/status")]
    public async Task<ActionResult<bool>> UpdateJobStatus(Guid jobId, UpdateBatchJobStatusCommand command)
    {
        var updatedCommand = command with { BatchJobId = jobId };
        var result = await _mediator.Send(updatedCommand);
        return Ok(result);
    }

    [HttpPost("jobs/{jobId}/reconcile")]
    public async Task<ActionResult<ReconciliationReport>> RunReconciliation(Guid jobId)
    {
        var result = await _reconciliationService.RunReconciliationAsync(jobId);
        return Ok(result);
    }

    [HttpGet("migration-dashboard")]
    public async Task<ActionResult<MigrationDashboard>> GetMigrationDashboard()
    {
        var result = await _reconciliationService.GetMigrationDashboardAsync();
        return Ok(result);
    }
}
