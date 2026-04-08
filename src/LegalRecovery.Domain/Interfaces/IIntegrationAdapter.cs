using LegalRecovery.Domain.Entities;

namespace LegalRecovery.Domain.Interfaces;

/// <summary>
/// Dual-mode integration adapter supporting both SFTP and API protocols.
/// Can switch between protocols via configuration without code changes.
/// </summary>
public interface IIntegrationAdapter
{
    string PartnerName { get; }
    Task<IntegrationExecution> ExecuteAsync(IntegrationPartner partner, CancellationToken cancellationToken = default);
    Task<IntegrationExecution> ExecuteWithFallbackAsync(IntegrationPartner partner, CancellationToken cancellationToken = default);
    Task<bool> TestConnectionAsync(IntegrationPartner partner, CancellationToken cancellationToken = default);
}
