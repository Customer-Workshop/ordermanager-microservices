using LegalRecovery.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LegalRecovery.Infrastructure.Persistence.Configurations;

public class IntegrationPartnerConfiguration : IEntityTypeConfiguration<IntegrationPartner>
{
    public void Configure(EntityTypeBuilder<IntegrationPartner> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.PartnerName).HasMaxLength(200).IsRequired();
        builder.Property(p => p.DataFormat).HasMaxLength(50);
        builder.Property(p => p.Frequency).HasMaxLength(50);
        builder.Property(p => p.ApiEndpointUrl).HasMaxLength(500);
        builder.Property(p => p.SftpHost).HasMaxLength(200);
        builder.Property(p => p.SftpPath).HasMaxLength(500);
        builder.HasIndex(p => p.PartnerName).IsUnique();
        builder.HasMany(p => p.Executions).WithOne(e => e.Partner).HasForeignKey(e => e.PartnerId);
    }
}

public class IntegrationExecutionConfiguration : IEntityTypeConfiguration<IntegrationExecution>
{
    public void Configure(EntityTypeBuilder<IntegrationExecution> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ReconciliationId).HasMaxLength(100);
        builder.HasIndex(e => e.PartnerId);
        builder.HasIndex(e => e.ExecutionStartTime);
    }
}

public class BatchJobInventoryConfiguration : IEntityTypeConfiguration<BatchJobInventory>
{
    public void Configure(EntityTypeBuilder<BatchJobInventory> builder)
    {
        builder.HasKey(j => j.Id);
        builder.Property(j => j.JobName).HasMaxLength(200).IsRequired();
        builder.Property(j => j.TriggerType).HasMaxLength(50);
        builder.Property(j => j.CronSchedule).HasMaxLength(100);
        builder.Property(j => j.NewEventTopic).HasMaxLength(200);
        builder.Property(j => j.NewServiceName).HasMaxLength(200);
        builder.HasIndex(j => j.JobName).IsUnique();
        builder.HasIndex(j => j.MigrationStatus);
    }
}

public class StoredProcedureCatalogConfiguration : IEntityTypeConfiguration<StoredProcedureCatalog>
{
    public void Configure(EntityTypeBuilder<StoredProcedureCatalog> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.ProcedureName).HasMaxLength(300).IsRequired();
        builder.Property(p => p.SchemaName).HasMaxLength(100);
        builder.Property(p => p.ProcedureType).HasMaxLength(50);
        builder.Property(p => p.NewPlatformComponent).HasMaxLength(300);
        builder.HasIndex(p => new { p.SchemaName, p.ProcedureName }).IsUnique();
    }
}

public class DataWarehouseReportConfiguration : IEntityTypeConfiguration<DataWarehouseReport>
{
    public void Configure(EntityTypeBuilder<DataWarehouseReport> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.ReportName).HasMaxLength(300).IsRequired();
        builder.Property(r => r.AudienceRole).HasMaxLength(100);
        builder.Property(r => r.RefreshFrequency).HasMaxLength(50);
        builder.Property(r => r.PowerBiWorkspaceId).HasMaxLength(100);
        builder.Property(r => r.PowerBiReportId).HasMaxLength(100);
    }
}

public class SuitFilingConfiguration : IEntityTypeConfiguration<SuitFiling>
{
    public void Configure(EntityTypeBuilder<SuitFiling> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.CaseNumber).HasMaxLength(50);
        builder.Property(f => f.ConfirmationNumber).HasMaxLength(100);
        builder.Property(f => f.FilingStatus).HasMaxLength(50);
        builder.Property(f => f.RejectionReason).HasMaxLength(1000);
        builder.Property(f => f.FilingFee).HasPrecision(18, 2);
        builder.Property(f => f.TrackingNumber).HasMaxLength(100);
        builder.HasIndex(f => f.AccountId);
        builder.HasOne(f => f.Account).WithMany().HasForeignKey(f => f.AccountId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(f => f.Courthouse).WithMany().HasForeignKey(f => f.CourthouseId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class GarnishmentWritConfiguration : IEntityTypeConfiguration<GarnishmentWrit>
{
    public void Configure(EntityTypeBuilder<GarnishmentWrit> builder)
    {
        builder.HasKey(w => w.Id);
        builder.Property(w => w.WritType).HasMaxLength(50);
        builder.Property(w => w.EmployerName).HasMaxLength(300);
        builder.Property(w => w.BankName).HasMaxLength(300);
        builder.Property(w => w.GarnishmentAmount).HasPrecision(18, 2);
        builder.Property(w => w.Status).HasMaxLength(50);
        builder.HasIndex(w => w.AccountId);
        builder.HasOne(w => w.Account).WithMany().HasForeignKey(w => w.AccountId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(w => w.Courthouse).WithMany().HasForeignKey(w => w.CourthouseId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(w => w.Template).WithMany().HasForeignKey(w => w.TemplateId).OnDelete(DeleteBehavior.Restrict);
    }
}
