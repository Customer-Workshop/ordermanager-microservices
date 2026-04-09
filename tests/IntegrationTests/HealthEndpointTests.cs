using System.Net;
using IntegrationTests.Factories;

namespace IntegrationTests;

public class HealthEndpointTests
    : IClassFixture<ProductServiceFactory>,
      IClassFixture<CustomerServiceFactory>,
      IClassFixture<InventoryServiceFactory>,
      IClassFixture<OrderServiceFactory>,
      IClassFixture<ApiGatewayFactory>
{
    private readonly HttpClient _productClient;
    private readonly HttpClient _customerClient;
    private readonly HttpClient _inventoryClient;
    private readonly HttpClient _orderClient;
    private readonly HttpClient _gatewayClient;

    public HealthEndpointTests(
        ProductServiceFactory productFactory,
        CustomerServiceFactory customerFactory,
        InventoryServiceFactory inventoryFactory,
        OrderServiceFactory orderFactory,
        ApiGatewayFactory gatewayFactory)
    {
        _productClient = productFactory.CreateClient();
        _customerClient = customerFactory.CreateClient();
        _inventoryClient = inventoryFactory.CreateClient();
        _orderClient = orderFactory.CreateClient();
        _gatewayClient = gatewayFactory.CreateClient();
    }

    [Fact]
    public async Task ProductService_HealthEndpoint_ReturnsHealthy()
    {
        var response = await _productClient.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Healthy", body);
    }

    [Fact]
    public async Task CustomerService_HealthEndpoint_ReturnsHealthy()
    {
        var response = await _customerClient.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Healthy", body);
    }

    [Fact]
    public async Task InventoryService_HealthEndpoint_ReturnsHealthy()
    {
        var response = await _inventoryClient.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Healthy", body);
    }

    [Fact]
    public async Task OrderService_HealthEndpoint_ReturnsHealthy()
    {
        var response = await _orderClient.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Healthy", body);
    }

    [Fact]
    public async Task ApiGateway_HealthEndpoint_ReturnsHealthy()
    {
        var response = await _gatewayClient.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Healthy", body);
    }
}
