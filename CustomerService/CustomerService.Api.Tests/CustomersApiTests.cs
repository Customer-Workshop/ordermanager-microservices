using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace CustomerService.Api.Tests;

public class CustomersApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public CustomersApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAllCustomers_ReturnsOkWithSeededData()
    {
        var response = await _client.GetAsync("/api/customers");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var customers = await response.Content.ReadFromJsonAsync<List<CustomerDto>>(JsonOptions);
        Assert.NotNull(customers);
        Assert.True(customers.Count >= 3, "Expected at least 3 seeded customers");
    }

    [Fact]
    public async Task GetCustomerById_WithValidId_ReturnsOkWithCustomer()
    {
        // First get all customers to find a valid ID
        var allResponse = await _client.GetAsync("/api/customers");
        var customers = await allResponse.Content.ReadFromJsonAsync<List<CustomerDto>>(JsonOptions);
        Assert.NotNull(customers);
        Assert.NotEmpty(customers);

        var firstCustomer = customers[0];
        var response = await _client.GetAsync($"/api/customers/{firstCustomer.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var customer = await response.Content.ReadFromJsonAsync<CustomerDto>(JsonOptions);
        Assert.NotNull(customer);
        Assert.Equal(firstCustomer.Id, customer.Id);
        Assert.False(string.IsNullOrWhiteSpace(customer.Name));
        Assert.False(string.IsNullOrWhiteSpace(customer.Email));
    }

    [Fact]
    public async Task GetCustomerById_WithInvalidId_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/customers/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateCustomer_WithValidData_ReturnsCreated()
    {
        var newCustomer = new
        {
            Name = "Test Customer",
            Email = "test@example.com",
            Phone = "555-9999",
            Address = "999 Test St",
            City = "Testville",
            State = "TX",
            ZipCode = "75001"
        };

        var response = await _client.PostAsJsonAsync("/api/customers", newCustomer);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var created = await response.Content.ReadFromJsonAsync<CustomerDto>(JsonOptions);
        Assert.NotNull(created);
        Assert.True(created.Id > 0);
        Assert.Equal("Test Customer", created.Name);
        Assert.Equal("test@example.com", created.Email);
        Assert.Equal("555-9999", created.Phone);
        Assert.Equal("999 Test St", created.Address);
        Assert.Equal("Testville", created.City);
        Assert.Equal("TX", created.State);
        Assert.Equal("75001", created.ZipCode);

        // Verify Location header points to the new resource
        Assert.NotNull(response.Headers.Location);
        Assert.Contains($"/api/customers/{created.Id}", response.Headers.Location.ToString(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateCustomer_AppearsInGetAll()
    {
        var newCustomer = new
        {
            Name = "Roundtrip Customer",
            Email = "roundtrip@example.com",
            Phone = "555-8888",
            Address = "888 Round St",
            City = "Loopville",
            State = "CA",
            ZipCode = "90001"
        };

        var createResponse = await _client.PostAsJsonAsync("/api/customers", newCustomer);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var allResponse = await _client.GetAsync("/api/customers");
        var customers = await allResponse.Content.ReadFromJsonAsync<List<CustomerDto>>(JsonOptions);
        Assert.NotNull(customers);
        Assert.Contains(customers, c => c.Email == "roundtrip@example.com");
    }

    [Fact]
    public async Task GetAllCustomers_ResponseShape_HasExpectedFields()
    {
        var response = await _client.GetAsync("/api/customers");
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var array = doc.RootElement;

        Assert.Equal(JsonValueKind.Array, array.ValueKind);
        Assert.True(array.GetArrayLength() > 0);

        var first = array[0];
        Assert.True(first.TryGetProperty("id", out _));
        Assert.True(first.TryGetProperty("name", out _));
        Assert.True(first.TryGetProperty("email", out _));
        Assert.True(first.TryGetProperty("phone", out _));
        Assert.True(first.TryGetProperty("address", out _));
        Assert.True(first.TryGetProperty("city", out _));
        Assert.True(first.TryGetProperty("state", out _));
        Assert.True(first.TryGetProperty("zipCode", out _));
        Assert.True(first.TryGetProperty("createdAt", out _));
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsHealthy()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        Assert.Equal("Healthy", doc.RootElement.GetProperty("status").GetString());
    }

    private class CustomerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
