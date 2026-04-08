using FluentAssertions;
using LegalRecovery.Domain.Entities;
using LegalRecovery.Domain.Enums;
using LegalRecovery.Domain.Interfaces;
using LegalRecovery.Domain.RulesEngine;
using Moq;
using Xunit;

namespace LegalRecovery.Domain.Tests.RulesEngine;

public class JurisdictionRulesEngineTests
{
    private readonly Mock<IJurisdictionRepository> _repositoryMock;
    private readonly JurisdictionRulesEngine _engine;

    public JurisdictionRulesEngineTests()
    {
        _repositoryMock = new Mock<IJurisdictionRepository>();
        _engine = new JurisdictionRulesEngine(_repositoryMock.Object);
    }

    [Fact]
    public async Task EvaluateAccountSelectionAsync_WhenBalanceBelowMinimum_ShouldReturnIneligible()
    {
        // Arrange
        var stateId = Guid.NewGuid();
        var state = new State
        {
            Id = stateId,
            Code = "CA",
            Name = "California",
            DefaultMinimumBalance = 1000m,
            StatuteOfLimitationsMonths = 48,
            Counties = new List<County>()
        };

        var account = new Account
        {
            Id = Guid.NewGuid(),
            AccountNumber = "ACC-001",
            CurrentBalance = 500m,
            StateId = stateId
        };

        _repositoryMock.Setup(r => r.GetEffectiveRulesAsync(stateId, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<JurisdictionRule>());

        _repositoryMock.Setup(r => r.GetStateWithHierarchyAsync(stateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(state);

        // Act
        var result = await _engine.EvaluateAccountSelectionAsync(account);

        // Assert
        result.IsEligible.Should().BeFalse();
        result.ExclusionReasons.Should().ContainSingle()
            .Which.Should().Contain("below minimum");
    }

    [Fact]
    public async Task EvaluateAccountSelectionAsync_WhenBalanceAboveMinimum_ShouldReturnEligible()
    {
        // Arrange
        var stateId = Guid.NewGuid();
        var state = new State
        {
            Id = stateId,
            Code = "CA",
            Name = "California",
            DefaultMinimumBalance = 1000m,
            StatuteOfLimitationsMonths = 48,
            Counties = new List<County>()
        };

        var account = new Account
        {
            Id = Guid.NewGuid(),
            AccountNumber = "ACC-002",
            CurrentBalance = 5000m,
            StateId = stateId
        };

        _repositoryMock.Setup(r => r.GetEffectiveRulesAsync(stateId, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<JurisdictionRule>());

        _repositoryMock.Setup(r => r.GetStateWithHierarchyAsync(stateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(state);

        // Act
        var result = await _engine.EvaluateAccountSelectionAsync(account);

        // Assert
        result.IsEligible.Should().BeTrue();
        result.Score.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetEffectiveMinimumBalanceAsync_ShouldUseCourthouseOverride_WhenPresent()
    {
        // Arrange
        var stateId = Guid.NewGuid();
        var countyId = Guid.NewGuid();
        var courthouseId = Guid.NewGuid();

        var courthouse = new Courthouse
        {
            Id = courthouseId,
            Name = "LA Superior Court",
            MinimumBalanceOverride = 2000m,
            CountyId = countyId,
            County = new County
            {
                Id = countyId,
                Name = "Los Angeles",
                MinimumBalanceOverride = 1500m,
                StateId = stateId,
                State = new State
                {
                    Id = stateId,
                    Code = "CA",
                    Name = "California",
                    DefaultMinimumBalance = 1000m
                }
            }
        };

        _repositoryMock.Setup(r => r.GetCourthouseWithHierarchyAsync(courthouseId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(courthouse);

        // Act
        var result = await _engine.GetEffectiveMinimumBalanceAsync(stateId, countyId, courthouseId);

        // Assert - courthouse override should take precedence
        result.Should().Be(2000m);
    }

    [Fact]
    public async Task GetEffectiveMinimumBalanceAsync_ShouldFallbackToCounty_WhenCourthouseHasNoOverride()
    {
        // Arrange
        var stateId = Guid.NewGuid();
        var countyId = Guid.NewGuid();
        var courthouseId = Guid.NewGuid();

        var courthouse = new Courthouse
        {
            Id = courthouseId,
            Name = "LA Superior Court",
            MinimumBalanceOverride = null, // No courthouse override
            CountyId = countyId,
            County = new County
            {
                Id = countyId,
                Name = "Los Angeles",
                MinimumBalanceOverride = 1500m, // County override exists
                StateId = stateId,
                State = new State
                {
                    Id = stateId,
                    Code = "CA",
                    Name = "California",
                    DefaultMinimumBalance = 1000m
                }
            }
        };

        _repositoryMock.Setup(r => r.GetCourthouseWithHierarchyAsync(courthouseId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(courthouse);

        // Act
        var result = await _engine.GetEffectiveMinimumBalanceAsync(stateId, countyId, courthouseId);

        // Assert - county override should take precedence
        result.Should().Be(1500m);
    }

    [Fact]
    public async Task GetEffectiveMinimumBalanceAsync_ShouldFallbackToState_WhenNoOverrides()
    {
        // Arrange
        var stateId = Guid.NewGuid();
        var countyId = Guid.NewGuid();
        var courthouseId = Guid.NewGuid();

        var courthouse = new Courthouse
        {
            Id = courthouseId,
            Name = "Small Town Court",
            MinimumBalanceOverride = null,
            CountyId = countyId,
            County = new County
            {
                Id = countyId,
                Name = "Rural County",
                MinimumBalanceOverride = null,
                StateId = stateId,
                State = new State
                {
                    Id = stateId,
                    Code = "CA",
                    Name = "California",
                    DefaultMinimumBalance = 1000m
                }
            }
        };

        _repositoryMock.Setup(r => r.GetCourthouseWithHierarchyAsync(courthouseId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(courthouse);

        // Act
        var result = await _engine.GetEffectiveMinimumBalanceAsync(stateId, countyId, courthouseId);

        // Assert - state default should be used
        result.Should().Be(1000m);
    }

    [Fact]
    public async Task GetEffectiveRuleValueAsync_ShouldReturnMostSpecificRule()
    {
        // Arrange
        var stateId = Guid.NewGuid();
        var countyId = Guid.NewGuid();
        var courthouseId = Guid.NewGuid();

        var rules = new List<JurisdictionRule>
        {
            new()
            {
                RuleKey = "FilingFee",
                RuleValue = "50.00",
                Level = JurisdictionLevel.State,
                StateId = stateId,
                IsActive = true
            },
            new()
            {
                RuleKey = "FilingFee",
                RuleValue = "75.00",
                Level = JurisdictionLevel.County,
                CountyId = countyId,
                IsActive = true
            },
            new()
            {
                RuleKey = "FilingFee",
                RuleValue = "100.00",
                Level = JurisdictionLevel.Courthouse,
                CourthouseId = courthouseId,
                IsActive = true
            }
        };

        _repositoryMock.Setup(r => r.GetEffectiveRulesAsync(stateId, countyId, courthouseId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(rules);

        // Act
        var result = await _engine.GetEffectiveRuleValueAsync("FilingFee", stateId, countyId, courthouseId);

        // Assert - courthouse-level rule should win
        result.Should().Be("100.00");
    }
}
