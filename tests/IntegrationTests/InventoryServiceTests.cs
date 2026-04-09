using System.Net;
using System.Net.Http.Json;
using IntegrationTests.Factories;

namespace IntegrationTests;

public class InventoryServiceTests : IClassFixture<InventoryServiceFactory>
{
    private readonly HttpClient _client;

    public InventoryServiceTests(InventoryServiceFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAllInventory_ReturnsOkWithSeededData()
    {
        var response = await _client.GetAsync("/api/inventory");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var items = await response.Content.ReadFromJsonAsync<List<InventoryItemResponse>>();
        Assert.NotNull(items);
        Assert.True(items.Count >= 5);
    }

    [Fact]
    public async Task GetInventoryByProductId_ExistingProduct_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/inventory/product/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var item = await response.Content.ReadFromJsonAsync<InventoryItemResponse>();
        Assert.NotNull(item);
        Assert.Equal(1, item.ProductId);
        Assert.True(item.QuantityOnHand > 0);
    }

    [Fact]
    public async Task GetInventoryByProductId_NonExistentProduct_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/inventory/product/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task RestockProduct_ExistingProduct_ReturnsOkWithUpdatedQuantity()
    {
        var getBefore = await _client.GetAsync("/api/inventory/product/1");
        var before = await getBefore.Content.ReadFromJsonAsync<InventoryItemResponse>();
        Assert.NotNull(before);
        var originalQty = before.QuantityOnHand;

        var restockPayload = new { Quantity = 25 };
        var response = await _client.PostAsJsonAsync("/api/inventory/product/1/restock", restockPayload);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<InventoryItemResponse>();
        Assert.NotNull(updated);
        Assert.Equal(originalQty + 25, updated.QuantityOnHand);
    }

    [Fact]
    public async Task GetLowStock_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/inventory/low-stock");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var items = await response.Content.ReadFromJsonAsync<List<InventoryItemResponse>>();
        Assert.NotNull(items);
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

public class InventoryItemResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int QuantityOnHand { get; set; }
    public int ReorderLevel { get; set; }
    public string WarehouseLocation { get; set; } = string.Empty;
}
