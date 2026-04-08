using LegalRecovery.Domain.Entities;

namespace LegalRecovery.Domain.Interfaces;

public interface IDocumentTemplateRepository : IRepository<DocumentTemplate>
{
    Task<DocumentTemplate?> FindBestMatchAsync(Guid? stateId, Guid? countyId, Guid? courthouseId, string documentType, string productType, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DocumentTemplate>> SearchAsync(Guid? stateId, string? documentType, string? productType, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<(DocumentTemplate Template1, DocumentTemplate Template2, double Similarity)>> FindNearDuplicatesAsync(double similarityThreshold = 0.9, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DocumentTemplate>> GetRetirementCandidatesAsync(int unusedMonths = 24, CancellationToken cancellationToken = default);
    Task<int> GetActiveCountAsync(CancellationToken cancellationToken = default);
}
