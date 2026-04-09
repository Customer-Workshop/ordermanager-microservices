using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using InventoryService.Data;

namespace IntegrationTests.Factories;

public class InventoryServiceFactory : WebApplicationFactory<InventoryService.Program>
{
    private readonly string _dbName = "InventoryServiceTestDb_" + Guid.NewGuid().ToString("N");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<InventoryDbContext>));

            if (descriptor != null)
                services.Remove(descriptor);

            services.AddDbContext<InventoryDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));
        });
    }
}
