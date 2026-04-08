using System.Net.Http.Json;

namespace OrderService.Clients;

public class ProductClient
{
    private readonly HttpClient _httpClient;

    public ProductClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public virtual async Task<ProductDto?> GetProductAsync(int id)
    {
        var response = await _httpClient.GetAsync($"/api/products/{id}");
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<ProductDto>();
    }
}

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
}
