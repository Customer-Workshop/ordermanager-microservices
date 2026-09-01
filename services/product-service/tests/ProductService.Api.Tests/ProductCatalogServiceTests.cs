using Microsoft.EntityFrameworkCore;
using ProductService.Api.Data;
using ProductService.Api.Models;
using ProductService.Api.Services;

namespace ProductService.Api.Tests;

public class ProductCatalogServiceTests
{
    [Fact]
    public async Task GetAllProducts_ReturnsSeededProducts()
    {
        using var database = CreateDatabase();
        var service = new ProductCatalogService(database.Context);

        var products = await service.GetAllProductsAsync();

        Assert.Equal(5, products.Count);
        Assert.All(products, product => Assert.NotNull(product.Inventory));
    }

    [Fact]
    public async Task GetProductById_ReturnsMatchingProduct()
    {
        using var database = CreateDatabase();
        var service = new ProductCatalogService(database.Context);

        var product = await service.GetProductByIdAsync(1);

        Assert.NotNull(product);
        Assert.Equal("Widget A", product.Name);
    }

    [Fact]
    public async Task CreateProduct_PersistsProduct()
    {
        using var database = CreateDatabase();
        var service = new ProductCatalogService(database.Context);
        var product = new Product
        {
            Name = "Unit Product",
            Description = "Unit test product",
            Category = "Tests",
            Price = 3.21m,
            Sku = "UNT-001"
        };

        var created = await service.CreateProductAsync(product);

        Assert.Equal(6, created.Id);
        Assert.Equal(created.Id, await database.Context.Products.CountAsync());
    }

    [Fact]
    public async Task GetProductsByCategory_ReturnsMatchingProducts()
    {
        using var database = CreateDatabase();
        var service = new ProductCatalogService(database.Context);

        var products = await service.GetProductsByCategoryAsync("Widgets");

        Assert.Equal(2, products.Count);
        Assert.All(products, product => Assert.Equal("Widgets", product.Category));
    }

    private static DatabaseHandle CreateDatabase()
    {
        var path = Path.Combine(Path.GetTempPath(), $"productservice-unit-{Guid.NewGuid():N}.db");
        var options = new DbContextOptionsBuilder<ProductDbContext>()
            .UseSqlite($"Data Source={path}")
            .Options;
        var context = new ProductDbContext(options);
        SeedData.Initialize(context);
        return new DatabaseHandle(context, path);
    }

    private sealed class DatabaseHandle : IDisposable
    {
        public DatabaseHandle(ProductDbContext context, string path)
        {
            Context = context;
            Path = path;
        }

        public ProductDbContext Context { get; }
        private string Path { get; }

        public void Dispose()
        {
            Context.Dispose();
            File.Delete(Path);
            File.Delete($"{Path}-shm");
            File.Delete($"{Path}-wal");
        }
    }
}
