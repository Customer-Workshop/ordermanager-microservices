using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ProductService.Api.Data;
using ProductService.Api.Models;
using Xunit;

namespace ProductService.Api.Tests;

public class ProductsContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ProductsContractTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ProductDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                services.AddDbContext<ProductDbContext>(options =>
                    options.UseInMemoryDatabase("TestProducts_" + Guid.NewGuid()));
            });
        });
    }

    private HttpClient CreateSeededClient()
    {
        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ProductDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                var dbName = "TestProducts_" + Guid.NewGuid();
                services.AddDbContext<ProductDbContext>(options =>
                    options.UseInMemoryDatabase(dbName));

                var sp = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ProductDbContext>();
                context.Database.EnsureCreated();
                SeedData.Initialize(context);
            });
        }).CreateClient();
        return client;
    }

    private HttpClient CreateEmptyClient()
    {
        var factory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ProductDbContext>));
                if (descriptor != null) services.Remove(descriptor);

                var dbName = "TestProductsEmpty_" + Guid.NewGuid();
                services.AddDbContext<ProductDbContext>(options =>
                    options.UseInMemoryDatabase(dbName));
            });
        });

        // Create the client (triggers app startup including SeedData.Initialize)
        var client = factory.CreateClient();

        // Clear seeded data so the database is empty for this test
        using var scope = factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ProductDbContext>();
        context.Products.RemoveRange(context.Products);
        context.SaveChanges();

        return client;
    }

    // ===== GET /api/products =====

    [Fact]
    public async Task GetAll_ReturnsOk_WithSeededProducts()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/api/products");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var products = await response.Content.ReadFromJsonAsync<List<Product>>();
        Assert.NotNull(products);
        Assert.Equal(5, products.Count);
    }

    [Fact]
    public async Task GetAll_ReturnsOk_EmptyList_WhenNoProducts()
    {
        var client = CreateEmptyClient();

        var response = await client.GetAsync("/api/products");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var products = await response.Content.ReadFromJsonAsync<List<Product>>();
        Assert.NotNull(products);
        Assert.Empty(products);
    }

    // ===== GET /api/products/{id} =====

    [Fact]
    public async Task GetById_ReturnsOk_WhenProductExists()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/api/products/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var product = await response.Content.ReadFromJsonAsync<Product>();
        Assert.NotNull(product);
        Assert.Equal(1, product.Id);
        Assert.False(string.IsNullOrEmpty(product.Name));
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenProductDoesNotExist()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/api/products/9999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ===== POST /api/products =====

    [Fact]
    public async Task Create_ReturnsCreated_WithValidProduct()
    {
        var client = CreateSeededClient();
        var newProduct = new
        {
            Name = "Test Product",
            Description = "A test product",
            Category = "Testing",
            Price = 99.99m,
            Sku = "TST-001"
        };

        var response = await client.PostAsJsonAsync("/api/products", newProduct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<Product>();
        Assert.NotNull(created);
        Assert.Equal("Test Product", created.Name);
        Assert.Equal("TST-001", created.Sku);
        Assert.True(created.Id > 0);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenNameIsMissing()
    {
        var client = CreateSeededClient();
        var invalidProduct = new
        {
            Name = (string?)null,
            Description = "Missing name",
            Category = "Testing",
            Price = 10.00m,
            Sku = "TST-BAD"
        };

        var response = await client.PostAsJsonAsync("/api/products", invalidProduct);

        Assert.True(
            response.StatusCode == HttpStatusCode.BadRequest ||
            response.StatusCode == HttpStatusCode.UnprocessableEntity,
            $"Expected 400 or 422 but got {(int)response.StatusCode}");
    }

    // ===== PUT /api/products/{id} =====

    [Fact]
    public async Task Update_ReturnsOk_WhenProductExists()
    {
        var client = CreateSeededClient();
        var updatedProduct = new
        {
            Name = "Updated Widget A",
            Description = "Updated description",
            Category = "Widgets",
            Price = 12.99m,
            Sku = "WGT-001"
        };

        var response = await client.PutAsJsonAsync("/api/products/1", updatedProduct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var product = await response.Content.ReadFromJsonAsync<Product>();
        Assert.NotNull(product);
        Assert.Equal("Updated Widget A", product.Name);
        Assert.Equal(12.99m, product.Price);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenProductDoesNotExist()
    {
        var client = CreateSeededClient();
        var updatedProduct = new
        {
            Name = "Nonexistent",
            Description = "Does not exist",
            Category = "Testing",
            Price = 1.00m,
            Sku = "NONE-001"
        };

        var response = await client.PutAsJsonAsync("/api/products/9999", updatedProduct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ===== GET /health =====

    [Fact]
    public async Task Health_ReturnsOk_WithHealthyStatus()
    {
        var client = CreateSeededClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Healthy", content);
    }
}
