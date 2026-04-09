using System.Net;
using System.Net.Http.Json;
using IntegrationTests.Factories;

namespace IntegrationTests;

public class CustomerServiceTests : IClassFixture<CustomerServiceFactory>
{
    private readonly HttpClient _client;

    public CustomerServiceTests(CustomerServiceFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAllCustomers_ReturnsOkWithSeededData()
    {
        var response = await _client.GetAsync("/api/customers");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var customers = await response.Content.ReadFromJsonAsync<List<CustomerResponse>>();
        Assert.NotNull(customers);
        Assert.True(customers.Count >= 3);
    }

    [Fact]
    public async Task GetCustomerById_ExistingId_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/customers/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var customer = await response.Content.ReadFromJsonAsync<CustomerResponse>();
        Assert.NotNull(customer);
        Assert.Equal(1, customer.Id);
        Assert.False(string.IsNullOrEmpty(customer.Name));
    }

    [Fact]
    public async Task GetCustomerById_NonExistentId_ReturnsNotFound()
    {
        var response = await _client.GetAsync("/api/customers/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateCustomer_ValidPayload_ReturnsCreated()
    {
        var newCustomer = new
        {
            Name = "Integration Test Corp",
            Email = $"test-{Guid.NewGuid():N}@integration.com",
            Phone = "555-9999",
            Address = "100 Test Lane",
            City = "Testville",
            State = "TX",
            ZipCode = "75001"
        };

        var response = await _client.PostAsJsonAsync("/api/customers", newCustomer);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<CustomerResponse>();
        Assert.NotNull(created);
        Assert.Equal(newCustomer.Name, created.Name);
        Assert.Equal(newCustomer.Email, created.Email);
        Assert.True(created.Id > 0);
    }

    [Fact]
    public async Task CreateCustomer_ThenGetById_RoundTrip()
    {
        var newCustomer = new
        {
            Name = "Roundtrip LLC",
            Email = $"roundtrip-{Guid.NewGuid():N}@test.com",
            Phone = "555-0001",
            Address = "1 Roundtrip Blvd",
            City = "Dallas",
            State = "TX",
            ZipCode = "75002"
        };

        var createResponse = await _client.PostAsJsonAsync("/api/customers", newCustomer);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<CustomerResponse>();
        Assert.NotNull(created);

        var getResponse = await _client.GetAsync($"/api/customers/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var fetched = await getResponse.Content.ReadFromJsonAsync<CustomerResponse>();
        Assert.NotNull(fetched);
        Assert.Equal(created.Id, fetched.Id);
        Assert.Equal(newCustomer.Name, fetched.Name);
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

public class CustomerResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
}
