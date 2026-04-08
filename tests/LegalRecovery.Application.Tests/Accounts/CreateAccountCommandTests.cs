using FluentAssertions;
using LegalRecovery.Application.Accounts.Commands;
using LegalRecovery.Domain.Enums;
using LegalRecovery.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LegalRecovery.Application.Tests.Accounts;

public class CreateAccountCommandTests
{
    private ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task Handle_ShouldCreateAccount_WithNewStatusAndAccountSelectionStage()
    {
        // Arrange
        using var context = CreateInMemoryContext();
        var handler = new CreateAccountCommandHandler(context);
        var command = new CreateAccountCommand
        {
            AccountNumber = "ACC-001",
            DebtorName = "Test Debtor",
            OriginalBalance = 5000m,
            CurrentBalance = 4500m,
            ProductType = "CreditCard"
        };

        // Act
        var id = await handler.Handle(command, CancellationToken.None);

        // Assert
        id.Should().NotBeEmpty();
        var account = await context.Accounts.FindAsync(id);
        account.Should().NotBeNull();
        account!.Status.Should().Be(AccountStatus.New);
        account.CurrentStage.Should().Be(ProcessStage.AccountSelection);
        account.AccountNumber.Should().Be("ACC-001");
    }
}
