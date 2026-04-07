using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using OrderService.Clients;
using OrderService.Data;
using OrderService.Services;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);

// Configure JSON serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Configure EF Core with SQLite
var dbPath = Path.Combine("/data", "orders.db");
builder.Services.AddDbContext<OrderDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// Register typed HTTP clients
builder.Services.AddHttpClient<CustomerClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["CUSTOMER_SERVICE_URL"] ?? "http://customer-service:8080"));
builder.Services.AddHttpClient<ProductClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["PRODUCT_SERVICE_URL"] ?? "http://product-service:8080"));
builder.Services.AddHttpClient<InventoryClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["INVENTORY_SERVICE_URL"] ?? "http://inventory-service:8080"));

// Register services
builder.Services.AddScoped<OrderSvc>();

// Health checks
builder.Services.AddHealthChecks();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
    context.Database.EnsureCreated();
}

// Middleware
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.UseHttpMetrics();

app.MapControllers();
app.MapHealthChecks("/health");
app.MapMetrics();

app.Run();
