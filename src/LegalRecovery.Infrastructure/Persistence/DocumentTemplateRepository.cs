using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;
using LegalRecovery.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Infrastructure.Persistence;

public class DocumentTemplateRepository : IDocumentTemplateRepository
{
    private readonly ApplicationDbContext _context;

    public DocumentTemplateRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DocumentTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.DocumentTemplates.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IReadOnlyList<DocumentTemplate>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.DocumentTemplates.ToListAsync(cancellationToken);
    }

    public async Task<DocumentTemplate> AddAsync(DocumentTemplate entity, CancellationToken cancellationToken = default)
    {
        _context.DocumentTemplates.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(DocumentTemplate entity, CancellationToken cancellationToken = default)
    {
        _context.DocumentTemplates.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(DocumentTemplate entity, CancellationToken cancellationToken = default)
    {
        _context.DocumentTemplates.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Finds the best matching template using jurisdiction inheritance:
    /// Courthouse > County > State.
    /// </summary>
    public async Task<DocumentTemplate?> FindBestMatchAsync(
        Guid? stateId, Guid? countyId, Guid? courthouseId,
        string documentType, string productType,
        CancellationToken cancellationToken = default)
    {
        // Try courthouse-specific first
        if (courthouseId.HasValue)
        {
            var courthouseTemplate = await _context.DocumentTemplates
                .Where(t => t.CourthouseId == courthouseId &&
                            t.DocumentType == documentType &&
                            t.ProductType == productType &&
                            t.Status == TemplateStatus.Active)
                .OrderByDescending(t => t.VersionNumber)
                .FirstOrDefaultAsync(cancellationToken);

            if (courthouseTemplate != null) return courthouseTemplate;
        }

        // Fall back to county
        if (countyId.HasValue)
        {
            var countyTemplate = await _context.DocumentTemplates
                .Where(t => t.CountyId == countyId &&
                            t.CourthouseId == null &&
                            t.DocumentType == documentType &&
                            t.ProductType == productType &&
                            t.Status == TemplateStatus.Active)
                .OrderByDescending(t => t.VersionNumber)
                .FirstOrDefaultAsync(cancellationToken);

            if (countyTemplate != null) return countyTemplate;
        }

        // Fall back to state
        if (stateId.HasValue)
        {
            return await _context.DocumentTemplates
                .Where(t => t.StateId == stateId &&
                            t.CountyId == null &&
                            t.CourthouseId == null &&
                            t.DocumentType == documentType &&
                            t.ProductType == productType &&
                            t.Status == TemplateStatus.Active)
                .OrderByDescending(t => t.VersionNumber)
                .FirstOrDefaultAsync(cancellationToken);
        }

        return null;
    }

    public async Task<IReadOnlyList<DocumentTemplate>> SearchAsync(
        Guid? stateId, string? documentType, string? productType,
        CancellationToken cancellationToken = default)
    {
        var query = _context.DocumentTemplates.AsQueryable();

        if (stateId.HasValue) query = query.Where(t => t.StateId == stateId);
        if (!string.IsNullOrEmpty(documentType)) query = query.Where(t => t.DocumentType == documentType);
        if (!string.IsNullOrEmpty(productType)) query = query.Where(t => t.ProductType == productType);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<(DocumentTemplate Template1, DocumentTemplate Template2, double Similarity)>>
        FindNearDuplicatesAsync(double similarityThreshold = 0.9, CancellationToken cancellationToken = default)
    {
        var templates = await _context.DocumentTemplates
            .Where(t => t.Status == TemplateStatus.Active && t.SimilarityScore.HasValue && t.SimilarityScore >= similarityThreshold)
            .ToListAsync(cancellationToken);

        var duplicates = new List<(DocumentTemplate, DocumentTemplate, double)>();
        foreach (var template in templates.Where(t => t.SimilarToTemplateId.HasValue))
        {
            var similar = templates.FirstOrDefault(t => t.Id == template.SimilarToTemplateId);
            if (similar != null)
            {
                duplicates.Add((template, similar, template.SimilarityScore ?? 0));
            }
        }

        return duplicates;
    }

    public async Task<IReadOnlyList<DocumentTemplate>> GetRetirementCandidatesAsync(
        int unusedMonths = 24, CancellationToken cancellationToken = default)
    {
        var cutoffDate = DateTime.UtcNow.AddMonths(-unusedMonths);
        return await _context.DocumentTemplates
            .Where(t => t.Status == TemplateStatus.Active &&
                        (t.LastUsedDate == null || t.LastUsedDate < cutoffDate))
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetActiveCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.DocumentTemplates
            .CountAsync(t => t.Status == TemplateStatus.Active, cancellationToken);
    }
}
