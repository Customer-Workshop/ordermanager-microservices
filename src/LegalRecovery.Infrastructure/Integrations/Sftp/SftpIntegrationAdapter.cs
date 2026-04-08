using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;
using LegalRecovery.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Renci.SshNet;

namespace LegalRecovery.Infrastructure.Integrations.Adapters;

/// <summary>
/// SFTP-based integration adapter for legacy file-drop integrations.
/// Supports the existing SFTP workflow during the migration to API.
/// </summary>
public class SftpIntegrationAdapter : IIntegrationAdapter
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SftpIntegrationAdapter> _logger;

    public SftpIntegrationAdapter(IConfiguration configuration, ILogger<SftpIntegrationAdapter> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public string PartnerName => "SFTP";

    public async Task<IntegrationExecution> ExecuteAsync(
        IntegrationPartner partner, CancellationToken cancellationToken = default)
    {
        var execution = new IntegrationExecution
        {
            PartnerId = partner.Id,
            ProtocolUsed = IntegrationProtocol.Sftp,
            ExecutionStartTime = DateTime.UtcNow
        };

        try
        {
            var sftpCredentialKey = $"Integration:{partner.PartnerName}:Sftp";
            var username = _configuration[$"{sftpCredentialKey}:Username"] ?? string.Empty;
            var password = _configuration[$"{sftpCredentialKey}:Password"] ?? string.Empty;

            using var client = new SftpClient(partner.SftpHost ?? string.Empty, username, password);
            await Task.Run(() => client.Connect(), cancellationToken);

            var files = client.ListDirectory(partner.SftpPath ?? "/");
            var fileCount = files.Count();

            client.Disconnect();

            execution.RecordsProcessed = fileCount;
            execution.IsSuccess = true;
            execution.ExecutionEndTime = DateTime.UtcNow;

            _logger.LogInformation("SFTP integration completed for {Partner}: {Count} files processed",
                partner.PartnerName, fileCount);
        }
        catch (Exception ex)
        {
            execution.IsSuccess = false;
            execution.ErrorMessage = ex.Message;
            execution.ExecutionEndTime = DateTime.UtcNow;
            _logger.LogError(ex, "SFTP integration failed for {Partner}", partner.PartnerName);
        }

        return execution;
    }

    public async Task<IntegrationExecution> ExecuteWithFallbackAsync(
        IntegrationPartner partner, CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync(partner, cancellationToken);
    }

    public async Task<bool> TestConnectionAsync(
        IntegrationPartner partner, CancellationToken cancellationToken = default)
    {
        try
        {
            var sftpCredentialKey = $"Integration:{partner.PartnerName}:Sftp";
            var username = _configuration[$"{sftpCredentialKey}:Username"] ?? string.Empty;
            var password = _configuration[$"{sftpCredentialKey}:Password"] ?? string.Empty;

            using var client = new SftpClient(partner.SftpHost ?? string.Empty, username, password);
            await Task.Run(() => client.Connect(), cancellationToken);
            var isConnected = client.IsConnected;
            client.Disconnect();
            return isConnected;
        }
        catch
        {
            return false;
        }
    }
}
