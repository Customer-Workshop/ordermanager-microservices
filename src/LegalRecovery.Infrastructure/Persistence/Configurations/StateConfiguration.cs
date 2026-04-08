using LegalRecovery.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LegalRecovery.Infrastructure.Persistence.Configurations;

public class StateConfiguration : IEntityTypeConfiguration<State>
{
    public void Configure(EntityTypeBuilder<State> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Code).HasMaxLength(2).IsRequired();
        builder.Property(s => s.Name).HasMaxLength(100).IsRequired();
        builder.Property(s => s.DefaultMinimumBalance).HasPrecision(18, 2);
        builder.HasIndex(s => s.Code).IsUnique();
        builder.HasMany(s => s.Counties).WithOne(c => c.State).HasForeignKey(c => c.StateId);
        builder.HasMany(s => s.Rules).WithOne(r => r.State).HasForeignKey(r => r.StateId);
    }
}

public class CountyConfiguration : IEntityTypeConfiguration<County>
{
    public void Configure(EntityTypeBuilder<County> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.FipsCode).HasMaxLength(10).IsRequired();
        builder.Property(c => c.Name).HasMaxLength(200).IsRequired();
        builder.Property(c => c.MinimumBalanceOverride).HasPrecision(18, 2);
        builder.HasIndex(c => new { c.StateId, c.FipsCode }).IsUnique();
        builder.HasMany(c => c.Courthouses).WithOne(ch => ch.County).HasForeignKey(ch => ch.CountyId);
        builder.HasMany(c => c.Rules).WithOne(r => r.County).HasForeignKey(r => r.CountyId);
    }
}

public class CourthouseConfiguration : IEntityTypeConfiguration<Courthouse>
{
    public void Configure(EntityTypeBuilder<Courthouse> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.CourthouseCode).HasMaxLength(20).IsRequired();
        builder.Property(c => c.Name).HasMaxLength(300).IsRequired();
        builder.Property(c => c.Address).HasMaxLength(500);
        builder.Property(c => c.FilingFeeOverride).HasPrecision(18, 2);
        builder.Property(c => c.MinimumBalanceOverride).HasPrecision(18, 2);
        builder.HasIndex(c => new { c.CountyId, c.CourthouseCode }).IsUnique();
        builder.HasMany(c => c.Rules).WithOne(r => r.Courthouse).HasForeignKey(r => r.CourthouseId);
        builder.HasMany(c => c.AuthorizedAttorneys).WithOne(a => a.Courthouse).HasForeignKey(a => a.CourthouseId);
    }
}

public class JurisdictionRuleConfiguration : IEntityTypeConfiguration<JurisdictionRule>
{
    public void Configure(EntityTypeBuilder<JurisdictionRule> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.RuleKey).HasMaxLength(200).IsRequired();
        builder.Property(r => r.RuleValue).HasMaxLength(1000).IsRequired();
        builder.HasIndex(r => new { r.RuleKey, r.StateId, r.CountyId, r.CourthouseId });
    }
}
