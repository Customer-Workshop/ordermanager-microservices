using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Interfaces;
using LegalRecovery.Domain.RulesEngine;
using LegalRecovery.Infrastructure.BatchCoexistence;
using LegalRecovery.Infrastructure.DataWarehouse;
using LegalRecovery.Infrastructure.Integrations.Adapters;
using LegalRecovery.Infrastructure.Messaging;
using LegalRecovery.Infrastructure.Persistence;
using LegalRecovery.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LegalRecovery.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        // Repositories
        services.AddScoped<IJurisdictionRepository, JurisdictionRepository>();
        services.AddScoped<IDocumentTemplateRepository, DocumentTemplateRepository>();

        // Rules Engine
        services.AddScoped<IRulesEngine, JurisdictionRulesEngine>();

        // Azure Services
        services.AddSingleton<IEventPublisher, AzureServiceBusPublisher>();
        services.AddSingleton<IBlobStorageService, AzureBlobStorageService>();

        // Integration Adapters
        services.AddScoped<SftpIntegrationAdapter>();
        services.AddScoped<ApiIntegrationAdapter>();
        services.AddScoped<IntegrationAdapterFactory>();
        services.AddHttpClient<ApiIntegrationAdapter>();

        // Batch Coexistence
        services.AddScoped<BatchEventReconciliationService>();

        // Data Warehouse Pipeline
        services.AddScoped<EventDrivenPipelineService>();

        return services;
    }
}
