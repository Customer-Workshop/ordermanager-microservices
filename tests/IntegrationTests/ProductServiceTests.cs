using System.Net;
using System.Net.Http.Json;
using IntegrationTests.Factories;

namespace IntegrationTests;

public class ProductServiceTests : IClassFixture<ProductServiceFactory>
{
    private readonly HttpClient _client;

    public ProductServiceTests(ProductServiceFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAllProducts_ReturnsOkWithSeededData()
    {
        var response = await _client.GetAsync("/api/products");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var products = await response.Content.ReadFromJsonAsync<List<ProductResponse>>();
        Assert.NotNull(products);
        Assert.True(products.Count >= 5);
    }

    [Fact]
    public async Task GetProductById_ExistingId_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/products/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var product = await response.Content.ReadFromJsonAsync<ProductResponse>();
        Assert.NotNull(product);
        Assert.Equal(1, product.Id);
        Assert.False(string.IsNullOrEmpty(product.Name));
    }

    [Fact]
    public async Task GetProductById_NonExistentId_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/products/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateProduct_ValidPayload_ReturnsCreated()
    {
        var newProduct = new
        {
            Name = "Integration Test Product",
            Description = "Created by integration test",
            Category = "TestCategory",
            Price = 42.99m,
            Sku = "INT-TEST-" + Guid.NewGuid().ToString("N")[..8]
        };

        var response = await _client.PostAsJsonAsync("/api/products", newProduct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<ProductResponse>();
        Assert.NotNull(created);
        Assert.Equal(newProduct.Name, created.Name);
        Assert.Equal(newProduct.Price, created.Price);
        Assert.True(created.Id > 0);
    }

    [Fact]
    public async Task CreateProduct_ThenGetById_RoundTrip()
    {
        var newProduct = new
        {
            Name = "Roundtrip Product",
            Description = "Verify create then get",
            Category = "RoundTrip",
            Price = 15.50m,
            Sku = "RT-" + Guid.NewGuid().ToString("N")[..8]
        };

        var createResponse = await _client.PostAsJsonAsync("/api/products", newProduct);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<ProductResponse>();
        Assert.NotNull(created);

        var getResponse = await _client.GetAsync($"/api/products/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var fetched = await getResponse.Content.ReadFromJsonAsync<ProductResponse>();
        Assert.NotNull(fetched);
        Assert.Equal(created.Id, fetched.Id);
        Assert.Equal(newProduct.Name, fetched.Name);
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsHealthy()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Healthy", body);
    }
}

public class ProductResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Sku { get; set; } = string.Empty;
}
