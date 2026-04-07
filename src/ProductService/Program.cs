using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Prometheus;
using ProductService.Data;
using ProductService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();

// Configure EF Core with SQLite
var dbPath = Path.Combine("/data", "products.db");
builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// Register application services
builder.Services.AddScoped<ProductSvc>();

// Configure CORS
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

// Apply migrations and seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ProductDbContext>();
    context.Database.EnsureCreated();
    await SeedData.InitializeAsync(context);
}

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.UseRouting();
app.UseHttpMetrics();
app.MapControllers();
app.MapHealthChecks("/health");
app.MapMetrics();

app.Run();
