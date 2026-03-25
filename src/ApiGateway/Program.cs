using Prometheus;

namespace ApiGateway;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Override cluster destination addresses from environment variables
        var clusterOverrides = new Dictionary<string, string>
        {
            { "customer-service", Environment.GetEnvironmentVariable("CUSTOMER_SERVICE_URL") ?? "http://customer-service:8080" },
            { "product-service", Environment.GetEnvironmentVariable("PRODUCT_SERVICE_URL") ?? "http://product-service:8080" },
            { "inventory-service", Environment.GetEnvironmentVariable("INVENTORY_SERVICE_URL") ?? "http://inventory-service:8080" },
            { "order-service", Environment.GetEnvironmentVariable("ORDER_SERVICE_URL") ?? "http://order-service:8080" }
        };

        foreach (var (clusterId, url) in clusterOverrides)
        {
            builder.Configuration[$"ReverseProxy:Clusters:{clusterId}:Destinations:default:Address"] = url;
        }

        // Add YARP reverse proxy services
        builder.Services.AddReverseProxy()
            .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

        // Add Swagger
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Add CORS
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
        });

        var app = builder.Build();

        // Use Swagger
        app.UseSwagger();
        app.UseSwaggerUI();

        // Use CORS
        app.UseCors();

        // Health check endpoint
        app.MapGet("/health", () => Results.Ok(new { Status = "Healthy" }));

        // Prometheus metrics endpoint
        app.UseHttpMetrics();
        app.MapMetrics("/metrics");

        // Map YARP reverse proxy
        app.MapReverseProxy();

        app.Run();
    }
}
