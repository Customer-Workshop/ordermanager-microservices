using FluentAssertions;
using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;
using Xunit;

namespace LegalRecovery.Domain.Tests.Entities;

public class JurisdictionHierarchyTests
{
    [Fact]
    public void State_ShouldInitializeWithDefaults()
    {
        var state = new State
        {
            Code = "CA",
            Name = "California",
            StatuteOfLimitationsMonths = 48,
            DefaultMinimumBalance = 1000m
        };

        state.Id.Should().NotBeEmpty();
        state.Code.Should().Be("CA");
        state.IsActive.Should().BeTrue();
        state.Counties.Should().BeEmpty();
    }

    [Fact]
    public void County_ShouldSupportOverrides()
    {
        var county = new County
        {
            FipsCode = "06037",
            Name = "Los Angeles",
            StateId = Guid.NewGuid(),
            StatuteOfLimitationsMonthsOverride = 36,
            MinimumBalanceOverride = 1500m
        };

        county.StatuteOfLimitationsMonthsOverride.Should().Be(36);
        county.MinimumBalanceOverride.Should().Be(1500m);
    }

    [Fact]
    public void Courthouse_ShouldTrackEFilingStatus()
    {
        var courthouse = new Courthouse
        {
            CourthouseCode = "LASC-001",
            Name = "LA Superior Court - Central District",
            CountyId = Guid.NewGuid(),
            EFilingStatus = EFilingStatus.Required,
            FilingFeeOverride = 75.50m
        };

        courthouse.EFilingStatus.Should().Be(EFilingStatus.Required);
        courthouse.FilingFeeOverride.Should().Be(75.50m);
    }

    [Fact]
    public void Account_ShouldStartInNewStatus()
    {
        var account = new Account
        {
            AccountNumber = "ACC-001",
            DebtorName = "Test Debtor",
            OriginalBalance = 5000m,
            CurrentBalance = 4500m,
            ProductType = "CreditCard"
        };

        account.Status.Should().Be(AccountStatus.New);
        account.CurrentStage.Should().Be(ProcessStage.AccountSelection);
    }

    [Fact]
    public void JurisdictionRule_ShouldSupportAllLevels()
    {
        var stateRule = new JurisdictionRule
        {
            RuleKey = "MinimumBalance",
            RuleValue = "1000",
            Level = JurisdictionLevel.State,
            StateId = Guid.NewGuid(),
            IsOverride = false
        };

        var courthouseRule = new JurisdictionRule
        {
            RuleKey = "MinimumBalance",
            RuleValue = "2000",
            Level = JurisdictionLevel.Courthouse,
            CourthouseId = Guid.NewGuid(),
            IsOverride = true
        };

        stateRule.Level.Should().Be(JurisdictionLevel.State);
        courthouseRule.Level.Should().Be(JurisdictionLevel.Courthouse);
        courthouseRule.IsOverride.Should().BeTrue();
    }

    [Fact]
    public void BatchJobInventory_ShouldTrackMigrationStatus()
    {
        var job = new BatchJobInventory
        {
            JobName = "AccountSelection_Daily",
            MappedStage = ProcessStage.AccountSelection,
            TriggerType = "Schedule",
            CronSchedule = "0 2 * * *"
        };

        job.MigrationStatus.Should().Be(BatchJobStatus.Active);
        job.IsObsolete.Should().BeFalse();
    }

    [Fact]
    public void IntegrationPartner_ShouldSupportDualMode()
    {
        var partner = new IntegrationPartner
        {
            PartnerName = "DocumentVendor",
            Direction = IntegrationDirection.Outbound,
            CurrentProtocol = IntegrationProtocol.Sftp,
            TargetProtocol = IntegrationProtocol.Api,
            IsDualModeEnabled = true,
            PartnerOffersApi = true,
            PollingIntervalMinutes = 15
        };

        partner.IsDualModeEnabled.Should().BeTrue();
        partner.CurrentProtocol.Should().Be(IntegrationProtocol.Sftp);
        partner.TargetProtocol.Should().Be(IntegrationProtocol.Api);
    }
}
