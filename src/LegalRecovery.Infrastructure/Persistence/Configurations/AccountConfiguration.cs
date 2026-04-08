using LegalRecovery.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LegalRecovery.Infrastructure.Persistence.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.AccountNumber).HasMaxLength(50).IsRequired();
        builder.Property(a => a.DebtorName).HasMaxLength(300).IsRequired();
        builder.Property(a => a.OriginalBalance).HasPrecision(18, 2);
        builder.Property(a => a.CurrentBalance).HasPrecision(18, 2);
        builder.Property(a => a.ProductType).HasMaxLength(100);
        builder.Property(a => a.SelectionScore).HasPrecision(18, 4);
        builder.Property(a => a.CaseNumber).HasMaxLength(50);
        builder.HasIndex(a => a.AccountNumber).IsUnique();
        builder.HasIndex(a => a.Status);
        builder.HasIndex(a => a.CurrentStage);
        builder.HasOne(a => a.State).WithMany().HasForeignKey(a => a.StateId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(a => a.County).WithMany().HasForeignKey(a => a.CountyId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(a => a.Courthouse).WithMany().HasForeignKey(a => a.CourthouseId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(a => a.AssignedAttorney).WithMany(at => at.AssignedAccounts).HasForeignKey(a => a.AssignedAttorneyId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(a => a.Documents).WithOne(d => d.Account).HasForeignKey(d => d.AccountId);
        builder.HasMany(a => a.StageHistory).WithOne(h => h.Account).HasForeignKey(h => h.AccountId);
    }
}

public class AccountStageHistoryConfiguration : IEntityTypeConfiguration<AccountStageHistory>
{
    public void Configure(EntityTypeBuilder<AccountStageHistory> builder)
    {
        builder.HasKey(h => h.Id);
        builder.HasIndex(h => h.AccountId);
        builder.HasIndex(h => h.TransitionDate);
    }
}

public class AccountDocumentConfiguration : IEntityTypeConfiguration<AccountDocument>
{
    public void Configure(EntityTypeBuilder<AccountDocument> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.DocumentType).HasMaxLength(100);
        builder.Property(d => d.Status).HasMaxLength(50);
        builder.Property(d => d.VendorOrderId).HasMaxLength(100);
        builder.Property(d => d.VendorName).HasMaxLength(200);
        builder.HasOne(d => d.Template).WithMany().HasForeignKey(d => d.TemplateId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class DocumentTemplateConfiguration : IEntityTypeConfiguration<DocumentTemplate>
{
    public void Configure(EntityTypeBuilder<DocumentTemplate> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.TemplateCode).HasMaxLength(50).IsRequired();
        builder.Property(t => t.Name).HasMaxLength(300).IsRequired();
        builder.Property(t => t.DocumentType).HasMaxLength(100);
        builder.Property(t => t.ProductType).HasMaxLength(100);
        builder.HasIndex(t => t.TemplateCode).IsUnique();
        builder.HasIndex(t => new { t.StateId, t.CountyId, t.CourthouseId, t.DocumentType, t.ProductType });
        builder.HasIndex(t => t.Status);
    }
}

public class AttorneyConfiguration : IEntityTypeConfiguration<Attorney>
{
    public void Configure(EntityTypeBuilder<Attorney> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.BarNumber).HasMaxLength(50).IsRequired();
        builder.Property(a => a.FirstName).HasMaxLength(100);
        builder.Property(a => a.LastName).HasMaxLength(100);
        builder.Property(a => a.FirmName).HasMaxLength(300);
        builder.Property(a => a.Email).HasMaxLength(200);
        builder.HasIndex(a => a.BarNumber).IsUnique();
        builder.HasMany(a => a.Credentials).WithOne(c => c.Attorney).HasForeignKey(c => c.AttorneyId);
    }
}

public class AttorneyCredentialConfiguration : IEntityTypeConfiguration<AttorneyCredential>
{
    public void Configure(EntityTypeBuilder<AttorneyCredential> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.BarAdmissionNumber).HasMaxLength(50);
        builder.HasIndex(c => new { c.AttorneyId, c.StateId, c.CountyId, c.CourthouseId });
    }
}
