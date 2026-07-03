using Microsoft.EntityFrameworkCore;
using ProductService.Api.Data;
using ProductService.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=products.db"));

builder.Services.AddScoped<ProductManager>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ProductDbContext>();
    SeedData.Initialize(context);
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.UseStaticFiles();
app.MapHealthChecks("/health");
app.MapControllers();
app.MapFallbackToFile("index.html");
app.Run();
