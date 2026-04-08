using LegalRecovery.Application.Common.Interfaces;
using LegalRecovery.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LegalRecovery.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<State> States => Set<State>();
    public DbSet<County> Counties => Set<County>();
    public DbSet<Courthouse> Courthouses => Set<Courthouse>();
    public DbSet<JurisdictionRule> JurisdictionRules => Set<JurisdictionRule>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<AccountStageHistory> AccountStageHistories => Set<AccountStageHistory>();
    public DbSet<AccountDocument> AccountDocuments => Set<AccountDocument>();
    public DbSet<DocumentTemplate> DocumentTemplates => Set<DocumentTemplate>();
    public DbSet<Attorney> Attorneys => Set<Attorney>();
    public DbSet<AttorneyCredential> AttorneyCredentials => Set<AttorneyCredential>();
    public DbSet<IntegrationPartner> IntegrationPartners => Set<IntegrationPartner>();
    public DbSet<IntegrationExecution> IntegrationExecutions => Set<IntegrationExecution>();
    public DbSet<BatchJobInventory> BatchJobInventories => Set<BatchJobInventory>();
    public DbSet<StoredProcedureCatalog> StoredProcedureCatalogs => Set<StoredProcedureCatalog>();
    public DbSet<DataWarehouseReport> DataWarehouseReports => Set<DataWarehouseReport>();
    public DbSet<SuitFiling> SuitFilings => Set<SuitFiling>();
    public DbSet<GarnishmentWrit> GarnishmentWrits => Set<GarnishmentWrit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
