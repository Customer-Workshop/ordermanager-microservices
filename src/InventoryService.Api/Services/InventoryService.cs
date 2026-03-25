using Microsoft.EntityFrameworkCore;
using InventoryService.Api.Data;
using InventoryService.Api.Models;

namespace InventoryService.Api.Services;

/// <summary>
/// Core business logic for inventory management operations.
/// Provides stock queries, restocking, deductions, and low-stock detection.
/// </summary>
public class InventoryItemService
{
    private readonly InventoryDbContext _context;

    /// <summary>Initializes the service with the inventory database context.</summary>
    public InventoryItemService(InventoryDbContext context)
    {
        _context = context;
    }

    /// <summary>Retrieves every inventory item in the database.</summary>
    public async Task<List<InventoryItem>> GetAllInventoryAsync()
    {
        return await _context.InventoryItems.ToListAsync();
    }

    /// <summary>Looks up the inventory record for a single product.</summary>
    /// <param name="productId">The product identifier.</param>
    public async Task<InventoryItem?> GetInventoryByProductIdAsync(int productId)
    {
        return await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId);
    }

    /// <summary>Adds <paramref name="quantity"/> units to the product's stock.</summary>
    /// <param name="productId">The product to restock.</param>
    /// <param name="quantity">Number of units to add.</param>
    /// <exception cref="ArgumentException">No inventory record for the product.</exception>
    public async Task<InventoryItem> RestockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId)
            ?? throw new ArgumentException($"No inventory record for product {productId}");
        item.QuantityOnHand += quantity;
        item.LastRestocked = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<InventoryItem> DeductStockAsync(int productId, int quantity)
    {
        var item = await _context.InventoryItems.FirstOrDefaultAsync(i => i.ProductId == productId)
            ?? throw new ArgumentException($"No inventory record for product {productId}");

        if (item.QuantityOnHand < quantity)
            throw new InvalidOperationException($"Insufficient stock for product {productId}. Available: {item.QuantityOnHand}");

        item.QuantityOnHand -= quantity;
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<List<InventoryItem>> GetLowStockItemsAsync()
    {
        return await _context.InventoryItems
            .Where(i => i.QuantityOnHand <= i.ReorderLevel)
            .ToListAsync();
    }
}
