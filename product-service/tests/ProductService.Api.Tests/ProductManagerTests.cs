using Microsoft.EntityFrameworkCore;
using Xunit;
using ProductService.Api.Data;
using ProductService.Api.Models;
using ProductService.Api.Services;

namespace ProductService.Api.Tests;

public class ProductManagerTests
{
    private ProductDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ProductDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new ProductDbContext(options);
        SeedData.Initialize(context);
        return context;
    }

    [Fact]
    public async Task GetAllProducts_ReturnsSeededProducts()
    {
        using var context = CreateContext();
        var manager = new ProductManager(context);
        var products = await manager.GetAllProductsAsync();
        Assert.Equal(5, products.Count);
    }

    [Fact]
    public async Task GetProductById_ReturnsProduct()
    {
        using var context = CreateContext();
        var manager = new ProductManager(context);
        var product = await manager.GetProductByIdAsync(1);
        Assert.NotNull(product);
        Assert.Equal(1, product!.Id);
    }

    [Fact]
    public async Task GetProductById_ReturnsNull_WhenMissing()
    {
        using var context = CreateContext();
        var manager = new ProductManager(context);
        var product = await manager.GetProductByIdAsync(999);
        Assert.Null(product);
    }

    [Fact]
    public async Task GetProductsByIds_ReturnsMatchingProducts()
    {
        using var context = CreateContext();
        var manager = new ProductManager(context);
        var products = await manager.GetProductsByIdsAsync(new[] { 1, 3, 999 });
        Assert.Equal(2, products.Count);
        Assert.Contains(products, p => p.Id == 1);
        Assert.Contains(products, p => p.Id == 3);
    }

    [Fact]
    public async Task GetProductsByIds_DeduplicatesIds()
    {
        using var context = CreateContext();
        var manager = new ProductManager(context);
        var products = await manager.GetProductsByIdsAsync(new[] { 1, 1, 1 });
        Assert.Single(products);
    }

    [Fact]
    public async Task GetProductsByCategory_ReturnsMatchingProducts()
    {
        using var context = CreateContext();
        var manager = new ProductManager(context);
        var products = await manager.GetProductsByCategoryAsync("Widgets");
        Assert.Equal(2, products.Count);
        Assert.All(products, p => Assert.Equal("Widgets", p.Category));
    }

    [Fact]
    public async Task CreateProduct_AddsProduct()
    {
        using var context = CreateContext();
        var manager = new ProductManager(context);
        var created = await manager.CreateProductAsync(new Product
        {
            Name = "Doohickey",
            Description = "A brand-new doohickey",
            Category = "Misc",
            Price = 4.99m,
            Sku = "DHK-001"
        });
        Assert.True(created.Id > 0);
        Assert.Equal(6, (await manager.GetAllProductsAsync()).Count);
    }

    [Theory]
    [InlineData("", "SKU-100")]
    [InlineData("   ", "SKU-100")]
    public async Task CreateProduct_ThrowsOnMissingName(string name, string sku)
    {
        using var context = CreateContext();
        var manager = new ProductManager(context);
        await Assert.ThrowsAsync<ArgumentException>(
            () => manager.CreateProductAsync(new Product { Name = name, Sku = sku, Price = 1m }));
    }

    [Fact]
    public async Task CreateProduct_ThrowsOnMissingSku()
    {
        using var context = CreateContext();
        var manager = new ProductManager(context);
        await Assert.ThrowsAsync<ArgumentException>(
            () => manager.CreateProductAsync(new Product { Name = "No SKU", Sku = "", Price = 1m }));
    }

    [Fact]
    public async Task CreateProduct_ThrowsOnNegativePrice()
    {
        using var context = CreateContext();
        var manager = new ProductManager(context);
        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(
            () => manager.CreateProductAsync(new Product { Name = "Bad Price", Sku = "BAD-001", Price = -1m }));
    }

    [Fact]
    public async Task CreateProduct_ThrowsOnDuplicateSku()
    {
        using var context = CreateContext();
        var manager = new ProductManager(context);
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => manager.CreateProductAsync(new Product { Name = "Duplicate", Sku = "WGT-001", Price = 1m }));
    }
}
