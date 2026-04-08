using FluentAssertions;
using LegalRecovery.Application.Jurisdictions.Commands;
using LegalRecovery.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LegalRecovery.Application.Tests.Jurisdictions;

public class CreateStateCommandTests
{
    private ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task Handle_ShouldCreateState_WhenValidCommand()
    {
        // Arrange
        using var context = CreateInMemoryContext();
        var handler = new CreateStateCommandHandler(context);
        var command = new CreateStateCommand
        {
            Code = "CA",
            Name = "California",
            StatuteOfLimitationsMonths = 48,
            DefaultMinimumBalance = 1000m
        };

        // Act
        var id = await handler.Handle(command, CancellationToken.None);

        // Assert
        id.Should().NotBeEmpty();
        var state = await context.States.FindAsync(id);
        state.Should().NotBeNull();
        state!.Code.Should().Be("CA");
        state.Name.Should().Be("California");
        state.StatuteOfLimitationsMonths.Should().Be(48);
        state.DefaultMinimumBalance.Should().Be(1000m);
    }
}
