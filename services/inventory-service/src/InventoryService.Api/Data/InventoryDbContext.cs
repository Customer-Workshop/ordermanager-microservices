using Microsoft.EntityFrameworkCore;
using InventoryService.Api.Models;

namespace InventoryService.Api.Data;

public class InventoryDbContext : DbContext
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Inventory)
            .WithOne(i => i.Product)
            .HasForeignKey<InventoryItem>(i => i.ProductId);

        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Sku)
            .IsUnique();
    }
}
