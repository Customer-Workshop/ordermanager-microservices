using System.Net.Http.Json;

namespace OrderService.Clients;

public class InventoryClient
{
    private readonly HttpClient _httpClient;

    public InventoryClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public virtual async Task<ReserveResult?> ReserveStockAsync(int productId, int quantity)
    {
        var response = await _httpClient.PostAsJsonAsync($"/api/inventory/product/{productId}/reserve", new { quantity });
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<ReserveResult>();
    }
}

public class ReserveResult
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int QuantityOnHand { get; set; }
}
