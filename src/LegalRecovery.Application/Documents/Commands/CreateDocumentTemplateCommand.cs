using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;
using MediatR;

namespace LegalRecovery.Application.Documents.Commands;

public record CreateDocumentTemplateCommand : IRequest<Guid>
{
    public string TemplateCode { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string DocumentType { get; init; } = string.Empty;
    public string ProductType { get; init; } = string.Empty;
    public DocumentFormat Format { get; init; }
    public Guid? StateId { get; init; }
    public Guid? CountyId { get; init; }
    public Guid? CourthouseId { get; init; }
    public DateTime EffectiveDate { get; init; }
    public DateTime? ExpirationDate { get; init; }
}

public class CreateDocumentTemplateCommandHandler : IRequestHandler<CreateDocumentTemplateCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateDocumentTemplateCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateDocumentTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = new DocumentTemplate
        {
            TemplateCode = request.TemplateCode,
            Name = request.Name,
            DocumentType = request.DocumentType,
            ProductType = request.ProductType,
            Format = request.Format,
            StateId = request.StateId,
            CountyId = request.CountyId,
            CourthouseId = request.CourthouseId,
            EffectiveDate = request.EffectiveDate,
            ExpirationDate = request.ExpirationDate
        };

        _context.DocumentTemplates.Add(template);
        await _context.SaveChangesAsync(cancellationToken);
        return template.Id;
    }
}
