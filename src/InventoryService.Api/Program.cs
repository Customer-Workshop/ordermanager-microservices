using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using InventoryService.Api.Data;
using InventoryService.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<InventoryDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=inventory.db"));

builder.Services.AddScoped<InventoryItemService>();

builder.Services.AddControllers().AddJsonOptions(options =>
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Inventory Service API",
        Version = "v1",
        Description = "Microservice responsible for managing product inventory, stock levels, warehouse locations, and reorder alerts. Decomposed from the OrderManager monolith.",
        Contact = new OpenApiContact
        {
            Name = "Platform Engineering Team"
        }
    });
    c.EnableAnnotations();
    c.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, "InventoryService.Api.xml"), includeControllerXmlComments: true);
});

builder.Services.AddHealthChecks()
    .AddDbContextCheck<InventoryDbContext>();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
    SeedData.Initialize(context);
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Inventory Service API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors();
app.UseStaticFiles();
app.MapControllers();
app.MapHealthChecks("/health");
app.MapFallbackToFile("index.html");
app.Run();
