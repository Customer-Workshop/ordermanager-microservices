using LegalRecovery.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<State> States { get; }
    DbSet<County> Counties { get; }
    DbSet<Courthouse> Courthouses { get; }
    DbSet<JurisdictionRule> JurisdictionRules { get; }
    DbSet<Account> Accounts { get; }
    DbSet<AccountStageHistory> AccountStageHistories { get; }
    DbSet<AccountDocument> AccountDocuments { get; }
    DbSet<DocumentTemplate> DocumentTemplates { get; }
    DbSet<Attorney> Attorneys { get; }
    DbSet<AttorneyCredential> AttorneyCredentials { get; }
    DbSet<IntegrationPartner> IntegrationPartners { get; }
    DbSet<IntegrationExecution> IntegrationExecutions { get; }
    DbSet<BatchJobInventory> BatchJobInventories { get; }
    DbSet<StoredProcedureCatalog> StoredProcedureCatalogs { get; }
    DbSet<DataWarehouseReport> DataWarehouseReports { get; }
    DbSet<SuitFiling> SuitFilings { get; }
    DbSet<GarnishmentWrit> GarnishmentWrits { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
