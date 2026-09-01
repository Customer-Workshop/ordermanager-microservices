using System.Net;

namespace ProductService.Api.Tests;

public class ServiceEndpointTests : IClassFixture<ProductsApiFactory>
{
    private readonly HttpClient _client;

    public ServiceEndpointTests(ProductsApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealth_ReturnsOk()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetMetrics_ReturnsPrometheusText()
    {
        var response = await _client.GetAsync("/metrics");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("text/plain", response.Content.Headers.ContentType?.ToString());
    }
}
