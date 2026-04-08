using LegalRecovery.Application.Documents.Commands;
using LegalRecovery.Application.Documents.Queries;
using LegalRecovery.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LegalRecovery.Api.Controllers;

/// <summary>
/// Manages document templates (44,000+) with versioning, jurisdiction tagging, and rationalization.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DocumentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("templates")]
    public async Task<ActionResult<List<DocumentTemplateDto>>> SearchTemplates(
        [FromQuery] Guid? stateId, [FromQuery] Guid? countyId, [FromQuery] Guid? courthouseId,
        [FromQuery] string? documentType, [FromQuery] string? productType, [FromQuery] TemplateStatus? status)
    {
        var result = await _mediator.Send(new SearchDocumentTemplatesQuery
        {
            StateId = stateId,
            CountyId = countyId,
            CourthouseId = courthouseId,
            DocumentType = documentType,
            ProductType = productType,
            Status = status
        });
        return Ok(result);
    }

    [HttpPost("templates")]
    public async Task<ActionResult<Guid>> CreateTemplate(CreateDocumentTemplateCommand command)
    {
        var id = await _mediator.Send(command);
        return Created($"/api/documents/templates/{id}", id);
    }

    [HttpGet("rationalization-report")]
    public async Task<ActionResult<TemplateRationalizationReportDto>> GetRationalizationReport()
    {
        var result = await _mediator.Send(new GetTemplateRationalizationReportQuery());
        return Ok(result);
    }
}
