using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using OrderService.Data;

namespace IntegrationTests.Factories;

public class OrderServiceFactory : WebApplicationFactory<OrderService.Program>
{
    private readonly string _dbName = "OrderServiceTestDb_" + Guid.NewGuid().ToString("N");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<OrderDbContext>));

            if (descriptor != null)
                services.Remove(descriptor);

            services.AddDbContext<OrderDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));
        });
    }
}
