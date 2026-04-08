using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Documents.Queries;

public record SearchDocumentTemplatesQuery : IRequest<List<DocumentTemplateDto>>
{
    public Guid? StateId { get; init; }
    public Guid? CountyId { get; init; }
    public Guid? CourthouseId { get; init; }
    public string? DocumentType { get; init; }
    public string? ProductType { get; init; }
    public TemplateStatus? Status { get; init; }
}

public class DocumentTemplateDto
{
    public Guid Id { get; set; }
    public string TemplateCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public string ProductType { get; set; } = string.Empty;
    public string Format { get; set; } = string.Empty;
    public int VersionNumber { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime EffectiveDate { get; set; }
    public DateTime? LastUsedDate { get; set; }
    public int UsageCount { get; set; }
}

public class SearchDocumentTemplatesQueryHandler : IRequestHandler<SearchDocumentTemplatesQuery, List<DocumentTemplateDto>>
{
    private readonly IApplicationDbContext _context;

    public SearchDocumentTemplatesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DocumentTemplateDto>> Handle(
        SearchDocumentTemplatesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.DocumentTemplates.AsQueryable();

        if (request.StateId.HasValue)
            query = query.Where(t => t.StateId == request.StateId);
        if (request.CountyId.HasValue)
            query = query.Where(t => t.CountyId == request.CountyId);
        if (request.CourthouseId.HasValue)
            query = query.Where(t => t.CourthouseId == request.CourthouseId);
        if (!string.IsNullOrEmpty(request.DocumentType))
            query = query.Where(t => t.DocumentType == request.DocumentType);
        if (!string.IsNullOrEmpty(request.ProductType))
            query = query.Where(t => t.ProductType == request.ProductType);
        if (request.Status.HasValue)
            query = query.Where(t => t.Status == request.Status);

        return await query.Select(t => new DocumentTemplateDto
        {
            Id = t.Id,
            TemplateCode = t.TemplateCode,
            Name = t.Name,
            DocumentType = t.DocumentType,
            ProductType = t.ProductType,
            Format = t.Format.ToString(),
            VersionNumber = t.VersionNumber,
            Status = t.Status.ToString(),
            EffectiveDate = t.EffectiveDate,
            LastUsedDate = t.LastUsedDate,
            UsageCount = t.UsageCount
        }).ToListAsync(cancellationToken);
    }
}
