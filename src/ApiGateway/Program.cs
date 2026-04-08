var builder = WebApplication.CreateBuilder(args);

// Add YARP reverse proxy
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Health checks
builder.Services.AddHealthChecks();

// CORS — allow the Angular frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger for the gateway itself
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "OrderManager API Gateway",
        Version = "v1",
        Description = "YARP-based API Gateway routing to ProductService, CustomerService, InventoryService, and OrderService."
    });
});

var app = builder.Build();

app.UseCors();

// Swagger UI
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "API Gateway v1");

    // Aggregate downstream service swagger docs
    options.SwaggerEndpoint("http://localhost:5001/swagger/v1/swagger.json", "ProductService v1");
    options.SwaggerEndpoint("http://localhost:5002/swagger/v1/swagger.json", "CustomerService v1");
    options.SwaggerEndpoint("http://localhost:5003/swagger/v1/swagger.json", "InventoryService v1");
    options.SwaggerEndpoint("http://localhost:5004/swagger/v1/swagger.json", "OrderService v1");
});

// Health endpoint returning {"status":"Healthy"}
app.MapGet("/health", () =>
    Results.Ok(new { status = "Healthy" }))
    .ExcludeFromDescription();

app.MapReverseProxy();

app.Run();

// Make Program accessible for integration tests
public partial class Program { }
