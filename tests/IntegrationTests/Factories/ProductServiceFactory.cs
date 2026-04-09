using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ProductService.Data;

namespace IntegrationTests.Factories;

public class ProductServiceFactory : WebApplicationFactory<ProductService.Program>
{
    private readonly string _dbName = "ProductServiceTestDb_" + Guid.NewGuid().ToString("N");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ProductDbContext>));

            if (descriptor != null)
                services.Remove(descriptor);

            services.AddDbContext<ProductDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));
        });
    }
}
