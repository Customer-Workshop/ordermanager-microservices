using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;
using LegalRecovery.Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace LegalRecovery.Infrastructure.Integrations.Adapters;

/// <summary>
/// Factory that creates the appropriate integration adapter (SFTP or API)
/// based on partner configuration. Supports dual-mode operation where both
/// adapters run in parallel for reconciliation during SFTP-to-API migration.
/// </summary>
public class IntegrationAdapterFactory
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<IntegrationAdapterFactory> _logger;

    public IntegrationAdapterFactory(IServiceProvider serviceProvider, ILogger<IntegrationAdapterFactory> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public IIntegrationAdapter CreateAdapter(IntegrationPartner partner)
    {
        return partner.CurrentProtocol switch
        {
            IntegrationProtocol.Sftp => _serviceProvider.GetRequiredService<SftpIntegrationAdapter>(),
            IntegrationProtocol.Api => _serviceProvider.GetRequiredService<ApiIntegrationAdapter>(),
            _ => throw new NotSupportedException($"Protocol {partner.CurrentProtocol} not supported")
        };
    }

    public IIntegrationAdapter CreateTargetAdapter(IntegrationPartner partner)
    {
        if (!partner.TargetProtocol.HasValue)
            throw new InvalidOperationException($"Partner {partner.PartnerName} has no target protocol configured");

        return partner.TargetProtocol.Value switch
        {
            IntegrationProtocol.Sftp => _serviceProvider.GetRequiredService<SftpIntegrationAdapter>(),
            IntegrationProtocol.Api => _serviceProvider.GetRequiredService<ApiIntegrationAdapter>(),
            _ => throw new NotSupportedException($"Protocol {partner.TargetProtocol} not supported")
        };
    }

    /// <summary>
    /// Executes both adapters in parallel for dual-mode reconciliation.
    /// Returns the primary result and logs any discrepancies.
    /// </summary>
    public async Task<(IntegrationExecution Primary, IntegrationExecution? Secondary, bool HasDiscrepancies)>
        ExecuteDualModeAsync(IntegrationPartner partner, CancellationToken cancellationToken = default)
    {
        if (!partner.IsDualModeEnabled)
        {
            var adapter = CreateAdapter(partner);
            var result = await adapter.ExecuteAsync(partner, cancellationToken);
            return (result, null, false);
        }

        var primaryAdapter = CreateAdapter(partner);
        var secondaryAdapter = CreateTargetAdapter(partner);

        var primaryTask = primaryAdapter.ExecuteAsync(partner, cancellationToken);
        var secondaryTask = secondaryAdapter.ExecuteAsync(partner, cancellationToken);

        await Task.WhenAll(primaryTask, secondaryTask);

        var primaryResult = await primaryTask;
        var secondaryResult = await secondaryTask;

        var hasDiscrepancies = primaryResult.RecordsProcessed != secondaryResult.RecordsProcessed ||
                               primaryResult.IsSuccess != secondaryResult.IsSuccess;

        if (hasDiscrepancies)
        {
            _logger.LogWarning(
                "Dual-mode discrepancy for partner {Partner}: Primary={PrimaryRecords} records, Secondary={SecondaryRecords} records",
                partner.PartnerName, primaryResult.RecordsProcessed, secondaryResult.RecordsProcessed);
        }

        var reconciliationId = Guid.NewGuid().ToString();
        primaryResult.ReconciliationId = reconciliationId;
        primaryResult.HasDiscrepancies = hasDiscrepancies;
        secondaryResult.ReconciliationId = reconciliationId;
        secondaryResult.HasDiscrepancies = hasDiscrepancies;

        return (primaryResult, secondaryResult, hasDiscrepancies);
    }
}
